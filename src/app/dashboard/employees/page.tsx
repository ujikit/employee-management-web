"use client";

import { useState, useEffect } from "react";
import { Employee, EmployeeResponse } from "@/src/types/employee";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = getCookie("access_token");
      const res = await fetch("http://localhost:3000/api/v1/employee/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      const result: EmployeeResponse = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch employees");
      }

      setEmployees(result.data || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Employee Directory</h1>

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
                  <th scope="col" className="px-6 py-3">NIP</th>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Contact</th>
                  <th scope="col" className="px-6 py-3">Type</th>
                  <th scope="col" className="px-6 py-3">Joined Date</th>
                  <th scope="col" className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Loading employees...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{employee.nip}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{employee.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{employee.email}</span>
                          <span className="text-xs text-slate-400">{employee.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{employee.employment_type}</td>
                      <td className="px-6 py-4">
                        {new Date(employee.joined_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                          employee.status === "ACTIVE" 
                            ? "text-green-700 bg-green-100 border-green-200"
                            : "text-slate-700 bg-slate-100 border-slate-200"
                        }`}>
                          {employee.status}
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
