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
          const isActive = pathname === item.href;
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
