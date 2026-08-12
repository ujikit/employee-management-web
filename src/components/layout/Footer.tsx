import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 py-12">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <div className="flex flex-col items-center md:items-start gap-2 max-w-xs text-center md:text-left">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Briefcase className="h-6 w-6" />
            <span>EmployeeManagement</span>
          </Link>
          <p className="text-sm text-slate-500 mt-2">Making employee management simpler, faster, and more effective.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} EmployeeManagement Inc. All rights reserved.
      </div>
    </footer>
  );
}
