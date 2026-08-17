"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, ShieldAlert, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Employee, EmployeeResponse, PaginationMeta } from "@/src/types/employee";
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

  // Pagination & Sorting states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
    sort_by: "id",
    sort_order: "asc",
  });

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
  }, []);

  useEffect(() => {
    fetchEmployees(page, limit, sortBy, sortOrder);
  }, [page, limit, sortBy, sortOrder]);

  const fetchEmployees = async (
    currentPage: number,
    currentLimit: number,
    currentSortBy: string,
    currentSortOrder: "asc" | "desc"
  ) => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = getCookie("access_token");
      const res = await fetch(
        `${API_URL}/api/v1/employee/all?page=${currentPage}&limit=${currentLimit}&sort_by=${currentSortBy}&sort_order=${currentSortOrder}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
        }
      );

      const result: EmployeeResponse = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch employees");
      }

      setEmployees(result.data || []);
      if (result.meta) {
        setMeta(result.meta);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
    setPage(1); // Reset to page 1 on sort change
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
    );
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
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none group" onClick={() => handleSort("id")}>
                    <div className="flex items-center gap-1.5">
                      <span>ID</span>
                      {renderSortIcon("id")}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none group" onClick={() => handleSort("nip")}>
                    <div className="flex items-center gap-1.5">
                      <span>NIP</span>
                      {renderSortIcon("nip")}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none group" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      {renderSortIcon("name")}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none group" onClick={() => handleSort("position_id")}>
                    <div className="flex items-center gap-1.5">
                      <span>Jabatan</span>
                      {renderSortIcon("position_id")}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none group" onClick={() => handleSort("joined_at")}>
                    <div className="flex items-center gap-1.5">
                      <span>Tanggal Masuk</span>
                      {renderSortIcon("joined_at")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Loading employees...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{employee.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{employee.nip}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{employee.name}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{employee?.position?.name ?? '-'}</td>
                      <td className="px-6 py-4">
                        {new Date(employee.joined_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>entries per page (Total: {meta.total})</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="mr-2">
                Page <strong>{meta.page}</strong> of <strong>{meta.total_pages || 1}</strong>
              </span>
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={meta.page <= 1 || isLoading}
                className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, meta.total_pages))}
                disabled={meta.page >= meta.total_pages || isLoading}
                className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
