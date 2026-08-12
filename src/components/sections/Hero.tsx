"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="w-full bg-slate-50 py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            Manage your team with <span className="text-blue-600">confidence</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
            EmployeeManagement is the modern employee management system that brings payroll, attendance, and performance reviews into one intuitive platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link 
              href="/login" 
              className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700"
            >
              Login Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 text-slate-600"
            >
              Contact Sales
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
