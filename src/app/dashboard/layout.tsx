import Sidebar from "../../components/layout/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | EmployeeManagement",
  description: "Manage your employee profile and allowances.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar stays fixed on the left */}
      <Sidebar />
      
      {/* Main content area takes up the remaining space */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
