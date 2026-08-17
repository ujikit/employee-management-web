import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EmployeeManagement - Modern HR & Payroll Platform",
    template: "%s | EmployeeManagement",
  },
  description: "Comprehensive employee management platform for HR, attendance tracking, allowance management, and payroll.",
  keywords: ["Employee Management", "HR Software", "Payroll System", "Attendance Tracker", "Next.js HR"],
  authors: [{ name: "EmployeeManagement Team" }],
  creator: "EmployeeManagement",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://employee-management-web-eight.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "EmployeeManagement - Modern HR & Payroll Platform",
    description: "Streamline your team operations with central employee management, attendance logs, and allowances.",
    siteName: "EmployeeManagement",
  },
  twitter: {
    card: "summary_large_image",
    title: "EmployeeManagement - Modern HR & Payroll Platform",
    description: "Streamline your team operations with central employee management, attendance logs, and allowances.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
