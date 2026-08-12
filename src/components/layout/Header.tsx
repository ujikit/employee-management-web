import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Briefcase className="h-6 w-6" />
          <span>EmployeeManagement</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">Log in</Link>
          <Link href="/signup" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">Start Free</Link>
        </div>
      </div>
    </header>
  );
}
