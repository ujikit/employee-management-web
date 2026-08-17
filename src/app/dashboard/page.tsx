"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck } from "lucide-react";
import { API_URL } from "@/src/lib/config";

interface EmployeeCountData {
  total: number;
  kontrak: number;
  tetap: number;
}

interface EmployeeCountResponse {
  statusCode: number;
  method: string;
  message: string;
  timestamp: number;
  path: string;
  data: EmployeeCountData;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [roleId, setRoleId] = useState<number | null>(null);
  
  const [countData, setCountData] = useState<EmployeeCountData | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(true);
  const [countError, setCountError] = useState<string>("");

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

        if (payload.name) {
          setUserName(payload.name);
        }

        const currentRoleId = payload.role_id;
        setRoleId(currentRoleId);

        if (currentRoleId === 1) {
          setUserRole("Superadmin");
        } else if (currentRoleId === 2) {
          setUserRole("Manager");
        } else if (currentRoleId === 3) {
          setUserRole("Admin");
        } else {
          setUserRole("Employee");
        }

        // Only fetch employee counts if logged-in user is a Manager (role_id === 2)
        if (currentRoleId === 2) {
          fetchEmployeeCount(token);
        } else {
          setIsLoadingCount(false);
        }
      }
    } catch (error) {
      console.error("Failed to parse token for dashboard user info:", error);
      setIsLoadingCount(false);
    }
  }, []);

  const fetchEmployeeCount = async (token?: string) => {
    setIsLoadingCount(true);
    setCountError("");

    try {
      const activeToken = token || (() => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; access_token=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      })();

      const res = await fetch(`${API_URL}/api/v1/employee/count-employee`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(activeToken ? { "Authorization": `Bearer ${activeToken}` } : {}),
        },
      });

      const result: EmployeeCountResponse = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch employee count");
      }

      setCountData(result.data);
    } catch (err: any) {
      setCountError(err.message || "An error occurred while loading metrics");
    } finally {
      setIsLoadingCount(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>

      {/* Welcome Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-700 font-medium text-lg">
          Selamat Datang, <span className="font-bold text-blue-600">{userName ? userName : "Pengguna"}</span> {userRole ? `- ${userRole}` : ""}
        </p>
      </div>

      {/* Employee Statistics Grid (Only shown when role_id === 2 / Manager) */}
      {roleId === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Employee Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Pegawai</p>
              <p className="text-3xl font-extrabold text-slate-900">
                {isLoadingCount ? "..." : countData?.total ?? 0}
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="h-7 w-7" />
            </div>
          </div>

          {/* Permanent Employee (Tetap) Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pegawai Tetap</p>
              <p className="text-3xl font-extrabold text-slate-900">
                {isLoadingCount ? "..." : countData?.tetap ?? 0}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck className="h-7 w-7" />
            </div>
          </div>

          {/* Contract Employee (Kontrak) Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pegawai Kontrak</p>
              <p className="text-3xl font-extrabold text-slate-900">
                {isLoadingCount ? "..." : countData?.kontrak ?? 0}
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <UserCheck className="h-7 w-7" />
            </div>
          </div>
        </div>
      )}

      {roleId === 2 && countError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {countError}
        </div>
      )}
    </div>
  );
}
