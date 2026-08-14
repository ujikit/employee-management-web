"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, ShieldAlert } from "lucide-react";
import { Employee, EmployeeResponse } from "@/src/types/employee";
import { API_URL } from "@/src/lib/config";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Extract role_id from JWT token in cookies
    try {
      const token = getCookie("access_token");
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        setRoleId(payload.role_id);
      }
    } catch (err) {
      console.error("Failed to parse token:", err);
    }

    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = getCookie("access_token");
      const res = await fetch(`${API_URL}/api/v1/employee/all`, {
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

  // READ Permission: SuperAdmin (1) is hidden/blocked. Manager (2) and Admin (3) can view.
  if (roleId === 1) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl max-w-md">
          <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Access Restricted</h2>
          <p className="text-sm text-slate-600">
            SuperAdmin accounts do not have permission to view the employee directory.
          </p>
        </div>
      </div>
    );
  }

  // CREATE Permission: Only Admin (3) gets the Create button
  const canCreate = roleId === 3;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1>
        
        {canCreate && (
          <Link
            href="/dashboard/employees/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Link>
        )}
      </div>

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
                  <th scope="col" className="px-6 py-3">ID</th>
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
                      <td className="px-6 py-4 font-medium text-slate-900">{employee.id}</td>
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
