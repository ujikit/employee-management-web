import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://staffsync-example.com"),
  title: {
    default: "EmployeeManagement | Modern Employee Management System",
    template: "%s | EmployeeManagement"
  },
  description: "Streamline your HR processes, payroll, and performance reviews with our comprehensive employee management platform.",
  keywords: ["employee management", "HR software", "payroll", "performance review", "SaaS"],
  authors: [{ name: "EmployeeManagement Team" }],
  openGraph: {
    title: "EmployeeManagement | Modern Employee Management System",
    description: "Streamline your HR processes, payroll, and performance reviews with our comprehensive employee management platform.",
    url: "https://staffsync-example.com",
    siteName: "EmployeeManagement",
    images: [
      {
        url: "/og-image.png", // Ensure you add this image in the /public folder
        width: 1200,
        height: 630,
        alt: "EmployeeManagement Dashboard Preview"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EmployeeManagement | Modern Employee Management System",
    description: "Streamline your HR processes, payroll, and performance reviews.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
