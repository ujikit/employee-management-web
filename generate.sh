#!/bin/bash
set -e

echo "📁 Creating necessary directories..."
mkdir -p src/types
mkdir -p src/app/dashboard/employees
mkdir -p src/app/dashboard/attendance

echo "📝 Creating Employee Interfaces (src/types/employee.ts)..."
cat << 'EOF' > src/types/employee.ts
export interface Employee {
  id: number;
  nip: string;
  name: string;
  email: string;
  phone: string;
  photo_path: string | null;
  birth_place: string;
  birth_date: string;
  marital_status: string;
  children_count: number;
  joined_at: string;
  position_id: number;
  department_id: number;
  employment_type: string;
  gender: string;
  distance_km: number;
  district_id: number;
  full_address: string;
  status: string;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EmployeeResponse {
  statusCode: number;
  method: string;
  message: string;
  timestamp: number;
  path: string;
  data: Employee[];
}
EOF

echo "📝 Creating Attendance Interfaces (src/types/attendance.ts)..."
cat << 'EOF' > src/types/attendance.ts
export interface Attendance {
  id: number;
  employee_id: number;
  attendance_import_id: number;
  attendance_date: string;
  checkin_at: string;
  checkout_at: string;
  checkin_location: string;
  checkout_location: string;
  attendance_type: string;
  duration_hours: number;
  status: string;
  verification_status: string | null;
  verified_by_role: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceResponse {
  statusCode: number;
  method: string;
  message: string;
  timestamp: number;
  path: string;
  data: Attendance[];
}
EOF

echo "🧱 Updating Sidebar component (src/components/layout/Sidebar.tsx)..."
cat << 'EOF' > src/components/layout/Sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Wallet, Users, CalendarDays, LogOut, Briefcase } from "lucide-react";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [roleName, setRoleName] = useState("EmployeeMgt");

  useEffect(() => {
    try {
      const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

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
        const roleId = payload.role_id;

        if (roleId === 1) {
          setRoleName("Superadmin");
        } else if (roleId === 2) {
          setRoleName("Manager");
        } else if (roleId === 3) {
          setRoleName("Admin");
        }
      }
    } catch (error) {
      console.error("Failed to parse token for role_id:", error);
    }
  }, []);

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Employees", href: "/dashboard/employees", icon: Users },
    { name: "Attendance", href: "/dashboard/attendance", icon: CalendarDays },
    { name: "Allowance", href: "/dashboard/allowance", icon: Wallet },
  ];

  const handleLogout = async () => {
    try {
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  return (
    <aside className="flex flex-col w-64 h-screen bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-white">
          <Briefcase className="h-6 w-6 text-blue-500" />
          <span className="capitalize">{roleName}</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium text-red-400 hover:text-red-300 text-left"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
EOF

echo "📄 Creating Employees Page (src/app/dashboard/employees/page.tsx)..."
cat << 'EOF' > src/app/dashboard/employees/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Employee, EmployeeResponse } from "@/types/employee";

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
EOF

echo "📄 Creating Attendance Page (src/app/dashboard/attendance/page.tsx)..."
cat << 'EOF' > src/app/dashboard/attendance/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Attendance, AttendanceResponse } from "@/types/attendance";

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
                      <td className="px-6 py-4 font-medium">EMP-{String(record.employee_id).padStart(4, '0')}</td>
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
EOF

echo "✅ Script complete! Employees and Attendance pages have been generated."