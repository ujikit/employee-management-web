"use client";

import { useState, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { Attendance, AttendanceResponse } from "@/src/types/attendance";

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

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonResult = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonResult || jsonResult.length === 0) {
          toast.error("Excel file is empty or missing data.");
          return;
        }

        const payload = {
          attendances: jsonResult
        };

        console.log(JSON.stringify(payload));
        

        const token = getCookie("access_token");
        const res = await fetch("http://localhost:3000/api/v1/attendance/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (!res.ok) {
          // Handle specific backend validation errors (e.g. 422 Unprocessable Entity)
          if (typeof result.message === "object" && result.message !== null) {
            const errorEntries = Object.entries(result.message);
            errorEntries.forEach(([fieldKey, errVal]) => {
              const rawMessage = Array.isArray(errVal) ? errVal.join(", ") : String(errVal);
              const cleanMessage = rawMessage.replace("translation.CLASS_VALIDATION.", "").replaceAll("_", " ").toLowerCase();
              toast.error(`${fieldKey}: ${cleanMessage}`);
            });
            throw new Error("Validation failed. Check the uploaded data format.");
          }
          throw new Error(result.message || "Failed to upload attendance data");
        }

        toast.success(`Successfully uploaded ${jsonResult.length} attendance records!`);
        
        // Refresh the table with the new data
        await fetchAttendance();
        
      } catch (err: any) {
        console.error("Upload error:", err);
        if (err.message && !err.message.includes("Validation failed")) {
          toast.error(err.message || "An error occurred while uploading.");
        }
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      toast.error("Failed to read the Excel file locally.");
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Attendance Logs</h1>

        {/* Excel Import Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4" />
            {isLoading ? "Processing..." : "Import Excel"}
          </button>
        </div>
      </div>

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
                  <th scope="col" className="px-6 py-3">Nama</th>
                  <th scope="col" className="px-6 py-3">Hadir</th>
                  <th scope="col" className="px-6 py-3">Status Hadir</th>
                  <th scope="col" className="px-6 py-3 text-center">Izin</th>
                  <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Loading attendance logs...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{new Intl.DateTimeFormat('en-US', {
                        dateStyle: 'full'
                      }).format(new Date(record.attendance_date))}</td>
                      <td className="px-6 py-4 font-medium">{record.employee?.name}</td>
                      <td className="px-6 py-4 font-medium">{record.attendance_type}</td>
                      <td className="px-6 py-4 font-medium">{record.status}</td>
                      <td className="px-6 py-4 font-medium text-center">{record.employee_id}</td>
                      <td className="px-6 py-4 font-medium text-center"></td>
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
