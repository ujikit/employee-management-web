"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    try {
      // 1. Utility function to extract cookie by name
      const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const token = getCookie("access_token");

      if (token) {
        // 2. Decode the JWT payload
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const payload = JSON.parse(jsonPayload);

        // 3. Extract user name and map role_id to text label
        if (payload.name) {
          setUserName(payload.name);
        }

        const roleId = payload.role_id;
        if (roleId === 1) {
          setUserRole("Superadmin");
        } else if (roleId === 2) {
          setUserRole("Manager");
        } else if (roleId === 3) {
          setUserRole("Admin");
        } else {
          setUserRole("Employee");
        }
      }
    } catch (error) {
      console.error("Failed to parse token for dashboard user info:", error);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-600">
          Selamat Datang {userName ? userName : "Pengguna"} {userRole ? `- ${userRole}` : ""}
        </p>
      </div>
    </div>
  );
}
