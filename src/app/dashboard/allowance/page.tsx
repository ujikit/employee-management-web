"use client";

import { useState, useEffect } from "react";
import { AllowancePeriod, PeriodResponse, AllowanceDetail, DetailResponse } from "@/types/allowance";

// Utility function to get a specific cookie by name
const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function AllowancePage() {
  const [activeTab, setActiveTab] = useState<"detail" | "period">("detail");
  
  // Data states
  const [periods, setPeriods] = useState<AllowancePeriod[]>([]);
  const [details, setDetails] = useState<AllowanceDetail[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeTab === "period") {
      fetchPeriods();
    } else if (activeTab === "detail") {
      fetchDetails();
    }
  }, [activeTab]);

  const fetchPeriods = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = getCookie("access_token");

      const res = await fetch("http://localhost:3000/api/v1/allowance/period", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      const result: PeriodResponse = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch period data");
      }

      setPeriods(result.data || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetails = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = getCookie("access_token");

      const res = await fetch("http://localhost:3000/api/v1/allowance/detail", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      const result: DetailResponse = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch detail data");
      }

      setDetails(result.data || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Allowance Management</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs Header */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("detail")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "detail"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Page Detail
          </button>
          <button
            onClick={() => setActiveTab("period")}
            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "period"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Page Period
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          
          {/* --- PAGE DETAIL TAB --- */}
          {activeTab === "detail" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Allowance Details</h2>
              
              {error && (
                <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm text-left text-slate-600 whitespace-nowrap">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3">Employee ID</th>
                      <th scope="col" className="px-6 py-3">Base Fare</th>
                      <th scope="col" className="px-6 py-3">Distance (KM)</th>
                      <th scope="col" className="px-6 py-3">Attendance</th>
                      <th scope="col" className="px-6 py-3 text-right">Nominal</th>
                      <th scope="col" className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading details...
                          </div>
                        </td>
                      </tr>
                    ) : details.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                          No detail data found.
                        </td>
                      </tr>
                    ) : (
                      details.map((detail) => (
                        <tr key={detail.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {detail.employee_id}
                          </td>
                          <td className="px-6 py-4">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0
                            }).format(detail.base_fare)}
                          </td>
                          <td className="px-6 py-4">
                            {detail.rounded_km} km <span className="text-slate-400 text-xs">({detail.original_km} km)</span>
                          </td>
                          <td className="px-6 py-4">
                            {detail.attendance_days} days
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0
                            }).format(detail.nominal)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                              detail.eligibility_status === "ELIGIBLE" 
                                ? "text-green-700 bg-green-100 border-green-200"
                                : "text-amber-700 bg-amber-100 border-amber-200"
                            }`}>
                              {detail.eligibility_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- PAGE PERIOD TAB --- */}
          {activeTab === "period" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Calculation Periods</h2>
              
              {error && (
                <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="overflow-hidden border border-slate-200 rounded-lg">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-3">Period (MM/YYYY)</th>
                      <th scope="col" className="px-6 py-3 text-right">Total Amount</th>
                      <th scope="col" className="px-6 py-3 text-center">Recipients</th>
                      <th scope="col" className="px-6 py-3 text-center">Status</th>
                      <th scope="col" className="px-6 py-3">Calculated At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading periods...
                          </div>
                        </td>
                      </tr>
                    ) : periods.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                          No periods data found.
                        </td>
                      </tr>
                    ) : (
                      periods.map((period) => (
                        <tr key={period.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {String(period.period_month).padStart(2, '0')} / {period.period_year}
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0
                            }).format(period.total_amount)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {period.total_recipients}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full border border-blue-200">
                              {period.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {new Date(period.calculated_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
