"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { CreateEmployeePayload, EducationInput } from "@/src/types/employee";
import { API_URL } from "@/src/lib/config";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

// Helper function to turn raw validation keys into human-readable field labels
const formatFieldName = (key: string): string => {
  const parts = key.split('.');
  if (parts[0] === 'educations' && parts.length === 3) {
    const index = Number(parts[1]) + 1;
    const field = parts[2].replace('_', ' ');
    return `Education #${index} (${field})`;
  }
  return key.replace('_', ' ');
};

export default function CreateEmployeePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CreateEmployeePayload>({
    nip: "",
    name: "",
    email: "",
    phone: "",
    birth_place: "",
    district_id: 0,
    full_address: "",
    distance_km: 0,
    birth_date: "",
    marital_status: "kawin",
    children_count: 0,
    joined_at: "",
    position_id: 0,
    department_id: 0,
    employment_type: "PKWTT",
    status: "ACTIVE",
    educations: [
      { education_level: "", school_name: "", graduation_year: new Date().getFullYear() }
    ]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value
    }));
  };

  const handleEducationChange = (index: number, field: keyof EducationInput, value: string | number) => {
    setFormData((prev) => {
      const updated = [...prev.educations];
      updated[index] = {
        ...updated[index],
        [field]: field === "graduation_year" ? (value === "" ? 0 : Number(value)) : value
      };
      return { ...prev, educations: updated };
    });
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      educations: [
        ...prev.educations,
        { education_level: "", school_name: "", graduation_year: new Date().getFullYear() }
      ]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = getCookie("access_token");
      const res = await fetch(`${API_URL}/api/v1/employee/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        // Handle Validation Error Object (e.g. 422 Unprocessable Entity)
        if (typeof result.message === "object" && result.message !== null) {
          const errorEntries = Object.entries(result.message);
          
          errorEntries.forEach(([fieldKey, errVal]) => {
            const fieldLabel = formatFieldName(fieldKey);
            const rawMessage = Array.isArray(errVal) ? errVal.join(", ") : String(errVal);
            const cleanMessage = rawMessage.replace("translation.CLASS_VALIDATION.", "").replaceAll("_", " ").toLowerCase();

            toast.error(`${fieldLabel}: ${cleanMessage}`, {
              duration: 5000,
            });
          });

          throw new Error("Validation failed. Please check the highlighted fields.");
        }

        throw new Error(result.message || "Failed to create employee");
      }

      toast.success("Employee created successfully!");
      router.push("/dashboard/employees");
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during submission";
      setError(errorMessage);
      if (typeof errorMessage === "string" && !errorMessage.includes("Validation failed")) {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard/employees"
          className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create New Employee</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 border-b pb-3 border-slate-100">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">NIP</label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                placeholder="e.g. 11223344"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                placeholder="e.g. john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                placeholder="e.g. +6281234567890"
              />
            </div>
          </div>
        </div>

        {/* Personal & Employment Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 border-b pb-3 border-slate-100">Personal & Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Birth Place</label>
              <input
                type="text"
                name="birth_place"
                value={formData.birth_place}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                placeholder="e.g. Jakarta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Birth Date</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Joined Date</label>
              <input
                type="date"
                name="joined_at"
                value={formData.joined_at}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marital Status</label>
              <select
                name="marital_status"
                value={formData.marital_status}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
              >
                <option value="kawin">Kawin</option>
                <option value="tidak kawin">Tidak Kawin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Children Count</label>
              <input
                type="number"
                name="children_count"
                value={formData.children_count || ""}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
              >
                <option value="PKWTT">PKWTT</option>
                <option value="PKWT">PKWT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Position ID</label>
              <input
                type="number"
                name="position_id"
                value={formData.position_id || ""}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department ID</label>
              <input
                type="number"
                name="department_id"
                value={formData.department_id || ""}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 border-b pb-3 border-slate-100">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">District ID</label>
              <input
                type="number"
                name="district_id"
                value={formData.district_id || ""}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Distance (KM)</label>
              <input
                type="number"
                name="distance_km"
                value={formData.distance_km || ""}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
              <textarea
                name="full_address"
                rows={2}
                value={formData.full_address}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-600"
                placeholder="Enter street name, house number, etc."
              />
            </div>
          </div>
        </div>

        {/* Educations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Education Background</h2>
            <button
              type="button"
              onClick={addEducation}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" /> Add Education
            </button>
          </div>

          {formData.educations.map((edu, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-full md:w-1/4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Level</label>
                <input
                  type="text"
                  value={edu.education_level}
                  onChange={(e) => handleEducationChange(idx, "education_level", e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm text-slate-900"
                  placeholder="e.g. S1"
                />
              </div>
              <div className="w-full md:w-2/4">
                <label className="block text-xs font-medium text-slate-600 mb-1">School / University</label>
                <input
                  type="text"
                  value={edu.school_name}
                  onChange={(e) => handleEducationChange(idx, "school_name", e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm text-slate-900"
                  placeholder="e.g. Universitas Gadjah Mada"
                />
              </div>
              <div className="w-full md:w-1/4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={edu.graduation_year || ""}
                  onChange={(e) => handleEducationChange(idx, "graduation_year", e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm text-slate-900"
                  placeholder="e.g. 2020"
                />
              </div>
              {formData.educations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors mt-5"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-2">
          <Link
            href="/dashboard/employees"
            className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-colors"
          >
            {isLoading ? "Saving..." : "Save Employee"}
          </button>
        </div>

      </form>
    </div>
  );
}
