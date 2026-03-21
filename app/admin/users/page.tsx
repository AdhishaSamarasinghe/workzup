"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  Search,
  Download,
  UserPlus,
  ChevronDown,
  Mail,
  Eye,
  Ban,
} from "lucide-react";
import { AdminUser, getAdminUsers, toggleUserBanStatus } from "@/lib/admin/api";

type UserStatus = "Active" | "Suspended";
type VerificationLevel =
  | "Level 1 (Basic)"
  | "Level 2 (ID Verified)"
  | "Level 3 (Full)";

type UserRow = {
  id: string;
  name: string;
  code: string;
  email: string;
  status: UserStatus;
  verification: VerificationLevel;
  joinedDate: string;
  avatar: string;
  isBanned: boolean;
};

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
};

function getVerificationLabel(user: AdminUser): VerificationLevel {
  if (user.isVerified) return "Level 3 (Full)";
  return "Level 1 (Basic)";
}

function mapUserToRow(user: AdminUser, index: number): UserRow {
  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed User";

  const initials = fullName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: user.id,
    name: fullName,
    code: `WZU - ${String(index + 1).padStart(6, "0")}`,
    email: user.email,
    status: user.isBanned ? "Suspended" : "Active",
    verification: getVerificationLabel(user),
    joinedDate: new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    avatar: initials || "U",
    isBanned: user.isBanned,
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminUsers(searchValue);

      if (!response.success || !response.data) {
        setError(response.error || "Failed to fetch users");
        setUsers([]);
        return;
      }

      const mapped = response.data.map((user, index) => mapUserToRow(user, index));
      setUsers(mapped);
    } catch (error) {
      console.error("Failed to load users:", error);
      setError("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers(search);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search, loadUsers]);

  const handleToggleStatus = useCallback(
    async (user: UserRow) => {
      try {
        setActionLoadingId(user.id);
        setError("");

        const response = await toggleUserBanStatus(user.id, !user.isBanned);

        if (!response.success) {
          setError(response.error || "Failed to update user");
          return;
        }

        await loadUsers(search);
      } catch (error) {
        console.error("Failed to toggle user status:", error);
        setError("Failed to update user");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadUsers, search]
  );

  const columns: Column<UserRow>[] = useMemo(
    () => [
      {
        header: "Name & ID",
        accessor: (user: UserRow) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {user.avatar}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="mt-0.5 text-xs text-slate-400">{user.code}</p>
            </div>
          </div>
        ),
      },
      { header: "Email", accessor: "email" },
      {
        header: "Status",
        accessor: (user: UserRow) => (
          <StatusBadge
            status={user.status}
            type={user.status === "Active" ? "success" : "warning"}
          />
        ),
      },
      {
        header: "Verification",
        accessor: (user: UserRow) => (
          <div className="text-sm text-slate-600">{user.verification}</div>
        ),
      },
      { header: "Joined Date", accessor: "joinedDate" },
      {
        header: "Actions",
        accessor: (user: UserRow) => (
          <div className="flex items-center gap-3 text-slate-400">
            <button type="button" className="hover:text-slate-600">
              <Mail size={16} />
            </button>
            <button type="button" className="hover:text-slate-600">
              <Eye size={16} />
            </button>
            <button
              type="button"
              title={user.isBanned ? "Unban User" : "Ban User"}
              className="hover:text-rose-500 disabled:opacity-50"
              onClick={() => handleToggleStatus(user)}
              disabled={actionLoadingId === user.id}
            >
              <Ban size={16} />
            </button>
          </div>
        ),
      },
    ],
    [actionLoadingId, handleToggleStatus]
  );

  return (
    <>
      <AdminHeader title="User Management" />

      <div className="bg-slate-100 p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-[2rem] font-bold leading-none text-slate-900">
              User Management
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Review, verify and manage platform accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
            >
              <UserPlus size={16} />
              Add User
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative w-full xl:max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name, email, or candidate ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 xl:min-w-[150px]"
            >
              <span>Status: All</span>
              <ChevronDown size={16} />
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 xl:min-w-[170px]"
            >
              <span>Verification: All</span>
              <ChevronDown size={16} />
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 xl:min-w-[170px]"
            >
              <span>Joined: Last 30 Days</span>
              <ChevronDown size={16} />
            </button>
          </div>

          {error && (
            <div className="mt-4 text-sm text-rose-500">{error}</div>
          )}

          <div className="mt-4">
            {loading ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                Loading users...
              </div>
            ) : (
              <DataTable columns={columns} data={users} />
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>Showing 1 to {users.length} users</p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-400"
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-white"
              >
                1
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600"
              >
                2
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600"
              >
                3
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}