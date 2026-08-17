"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  UserCheck, 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  X, 
  Loader2 
} from "lucide-react";
import { UserItem, UserListResponse, UserPaginationMeta } from "@/src/types/user";
import { API_URL } from "@/src/lib/config";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // Pagination & Sorting states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [meta, setMeta] = useState<UserPaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
    sort_by: "id",
    sort_order: "asc",
  });

  // Modal & Action states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // New User Form State
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role_id: 3,
  });

  useEffect(() => {
    try {
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
        setRoleId(payload.role_id);
      }
    } catch (err) {
      console.error("Failed to parse token:", err);
    }
  }, []);

  useEffect(() => {
    if (roleId === 1) {
      fetchUsers(page, limit, sortBy, sortOrder);
    }
  }, [roleId, page, limit, sortBy, sortOrder]);

  const fetchUsers = async (
    currentPage: number,
    currentLimit: number,
    currentSortBy: string,
    currentSortOrder: "asc" | "desc"
  ) => {
    setIsLoading(true);
    setError("");

    try {
      const token = getCookie("access_token");
      const res = await fetch(
        `${API_URL}/api/v1/users?page=${currentPage}&limit=${currentLimit}&sort_by=${currentSortBy}&sort_order=${currentSortOrder}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const result: UserListResponse = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch users");
      }

      setUsers(result.data || []);
      if (result.meta) {
        setMeta(result.meta);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // --- CREATE USER ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = getCookie("access_token");
      const res = await fetch(`${API_URL}/api/v1/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role_id: Number(formData.role_id),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create user");

      setIsCreateOpen(false);
      setFormData({ name: "", username: "", email: "", password: "", role_id: 3 });
      setActionMessage("User created successfully!");
      setTimeout(() => setActionMessage(""), 3000);
      fetchUsers(page, limit, sortBy, sortOrder);
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UPDATE STATUS ---
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setUpdatingUserId(id);
    try {
      const token = getCookie("access_token");
      const res = await fetch(`${API_URL}/api/v1/users/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update status");

      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, status: newStatus } : user))
      );
      setActionMessage(`Status updated to ${newStatus}`);
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // --- DELETE USER ---
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);

    try {
      const token = getCookie("access_token");
      const res = await fetch(`${API_URL}/api/v1/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete user");

      setUserToDelete(null);
      setActionMessage("User deleted successfully!");
      setTimeout(() => setActionMessage(""), 3000);
      fetchUsers(page, limit, sortBy, sortOrder);
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnKey);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
    );
  };

  if (roleId !== null && roleId !== 1) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl max-w-md shadow-sm">
          <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Access Restricted</h2>
          <p className="text-sm text-slate-600">
            Only SuperAdmin accounts have permission to access User Management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <UserCheck className="h-7 w-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {actionMessage && (
        <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {actionMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm text-left text-slate-600 whitespace-nowrap">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none group" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      {renderSortIcon("name")}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none group" onClick={() => handleSort("username")}>
                    <div className="flex items-center gap-1.5">
                      <span>Username</span>
                      {renderSortIcon("username")}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer select-none group" onClick={() => handleSort("role")}>
                    <div className="flex items-center gap-1.5">
                      <span>Role</span>
                      {renderSortIcon("role")}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">Status</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr key={user.id ?? idx} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">@{user.username}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{user.role}</td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={user.status}
                          disabled={updatingUserId === user.id}
                          onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-2 py-1 border focus:outline-none cursor-pointer ${
                            user.status === "ACTIVE"
                              ? "text-green-700 bg-green-100 border-green-200"
                              : "text-slate-700 bg-slate-100 border-slate-200"
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>entries per page (Total: {meta.total})</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="mr-2">
                Page <strong>{meta.page}</strong> of <strong>{meta.total_pages || 1}</strong>
              </span>
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={meta.page <= 1 || isLoading}
                className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, meta.total_pages))}
                disabled={meta.page >= meta.total_pages || isLoading}
                className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="test admin"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="test_admin"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="test.admin@yopmail.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="Password@123"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 text-slate-900"
                >
                  <option value={1}>Superadmin</option>
                  <option value={2}>Manager HRD</option>
                  <option value={3}>Admin HRD</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete User?</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete user <strong>@{userToDelete.username}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
