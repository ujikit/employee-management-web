"use client";

import { useState, useEffect } from "react";
import { Attendance, AttendanceResponse } from "@/src/types/attendance";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = getCookie("access_token");
      const res = await fetch("http://localhost:3000/api/v1/attendance/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      const result: AttendanceResponse = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch attendance records");
      }

      setRecords(result.data || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("id-ID", {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Attendance Logs</h1>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm text-left text-slate-600 whitespace-nowrap">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Employee ID</th>
                  <th scope="col" className="px-6 py-3">Check In</th>
                  <th scope="col" className="px-6 py-3">Check Out</th>
                  <th scope="col" className="px-6 py-3">Duration (Hrs)</th>
                  <th scope="col" className="px-6 py-3 text-center">Type</th>
                  <th scope="col" className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Loading attendance logs...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {new Date(record.attendance_date).toLocaleDateString("id-ID", {
                          weekday: 'short', day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium">{record.employee_id}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{formatTime(record.checkin_at)}</span>
                          <span className="text-xs text-slate-400">{record.checkin_location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{formatTime(record.checkout_at)}</span>
                          <span className="text-xs text-slate-400">{record.checkout_location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{record.duration_hours}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                          {record.attendance_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                          record.status === "TERPENUHI" 
                            ? "text-green-700 bg-green-100 border-green-200"
                            : "text-amber-700 bg-amber-100 border-amber-200"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
