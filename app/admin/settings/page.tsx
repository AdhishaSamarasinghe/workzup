"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  KeyRound,
  Loader2,
  LogOut,
  Save,
  Shield,
  UserCog,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type NoticeType = "success" | "error" | "info";

type Notice = {
  type: NoticeType;
  message: string;
} | null;

type NotificationPrefs = {
  emailAlerts: boolean;
  weeklySummary: boolean;
  securityAlerts: boolean;
};

type ProfileForm = {
  fullName: string;
  phone: string;
  jobTitle: string;
};

const DEFAULT_PREFS: NotificationPrefs = {
  emailAlerts: true,
  weeklySummary: true,
  securityAlerts: true,
};

const STORAGE_KEY = "workzup:admin:settings:v1";

function readLocalPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    return {
      emailAlerts: Boolean(parsed.emailAlerts ?? DEFAULT_PREFS.emailAlerts),
      weeklySummary: Boolean(parsed.weeklySummary ?? DEFAULT_PREFS.weeklySummary),
      securityAlerts: Boolean(parsed.securityAlerts ?? DEFAULT_PREFS.securityAlerts),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    fullName: "",
    phone: "",
    jobTitle: "",
  });
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAdmin() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (mounted) {
          setNotice({
            type: "error",
            message: "Supabase is not configured. Unable to load admin settings.",
          });
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;

      if (error || !data.user) {
        setNotice({ type: "error", message: "Failed to load current admin user." });
        setLoading(false);
        return;
      }

      const metadata = data.user.user_metadata || {};
      const profileName =
        String(metadata.full_name || "").trim() ||
        `${String(metadata.first_name || "").trim()} ${String(metadata.last_name || "").trim()}`.trim() ||
        String(data.user.email || "").split("@")[0] ||
        "Admin User";

      setEmail(String(data.user.email || ""));
      setCreatedAt(new Date(data.user.created_at).toLocaleString());
      setProfileForm({
        fullName: profileName,
        phone: String(metadata.phone || ""),
        jobTitle: String(metadata.job_title || "Super Admin"),
      });

      const metadataPrefs = metadata.adminPrefs as Partial<NotificationPrefs> | undefined;
      const localPrefs = readLocalPrefs();

      setPrefs({
        emailAlerts: Boolean(metadataPrefs?.emailAlerts ?? localPrefs.emailAlerts),
        weeklySummary: Boolean(metadataPrefs?.weeklySummary ?? localPrefs.weeklySummary),
        securityAlerts: Boolean(metadataPrefs?.securityAlerts ?? localPrefs.securityAlerts),
      });

      setLoading(false);
    }

    loadAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    const parts = profileForm.fullName
      .split(" ")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2);

    if (parts.length === 0) return "A";
    return parts.map((part) => part[0]?.toUpperCase() || "").join("");
  }, [profileForm.fullName]);

  const updateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotice(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setNotice({ type: "error", message: "Supabase is not configured." });
      return;
    }

    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: profileForm.fullName,
        phone: profileForm.phone,
        job_title: profileForm.jobTitle,
      },
    });

    if (error) {
      setNotice({ type: "error", message: error.message || "Failed to save profile settings." });
    } else {
      setNotice({ type: "success", message: "Profile settings saved successfully." });
    }
    setSavingProfile(false);
  };

  const savePreferences = async () => {
    setNotice(null);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setNotice({ type: "info", message: "Saved locally. Connect Supabase to sync across devices." });
      return;
    }

    setSavingPrefs(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        adminPrefs: prefs,
      },
    });

    if (error) {
      setNotice({ type: "error", message: error.message || "Failed to save notification preferences." });
    } else {
      setNotice({ type: "success", message: "Notification preferences updated." });
    }
    setSavingPrefs(false);
  };

  const changePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotice(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setNotice({ type: "error", message: "Please fill all password fields." });
      return;
    }

    if (newPassword.length < 8) {
      setNotice({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotice({ type: "error", message: "Password confirmation does not match." });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setNotice({ type: "error", message: "Supabase is not configured." });
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setNotice({ type: "error", message: error.message || "Failed to update password." });
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice({ type: "success", message: "Password updated successfully." });
    }
    setSavingPassword(false);
  };

  const signOutCurrentSession = async () => {
    setNotice(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setNotice({ type: "error", message: "Supabase is not configured." });
      return;
    }

    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <>
      <AdminHeader title="Settings" />

      <div className="bg-slate-100 p-6 md:p-8">
        {notice ? (
          <div
            className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : notice.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            {notice.message}
          </div>
        ) : null}

        {loading ? (
          <div className="flex h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading settings...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
            <section className="space-y-6">
              <form
                onSubmit={updateProfile}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="rounded-xl bg-blue-100 p-2 text-blue-600">
                    <UserCog size={16} />
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900">Profile Settings</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Job Title</label>
                    <input
                      type="text"
                      value={profileForm.jobTitle}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, jobTitle: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Phone</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="+94XXXXXXXXX"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Profile
                  </button>
                </div>
              </form>

              <form
                onSubmit={changePassword}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="rounded-xl bg-amber-100 p-2 text-amber-600">
                    <KeyRound size={16} />
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900">Security</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  For security, use at least 8 characters with letters and numbers.
                </p>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                    Update Password
                  </button>
                </div>
              </form>
            </section>

            <section className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Account Summary</h2>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{profileForm.fullName || "Admin User"}</p>
                    <p className="text-sm text-slate-500">{email}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Role</span>
                    <span className="font-semibold text-slate-900">ADMIN</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Account Created</span>
                    <span className="font-semibold text-slate-900">{createdAt || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <span className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                    <Bell size={16} />
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: "emailAlerts" as const,
                      label: "Email Alerts",
                      text: "Important platform and moderation updates.",
                    },
                    {
                      key: "weeklySummary" as const,
                      label: "Weekly Summary",
                      text: "Receive weekly admin insight reports.",
                    },
                    {
                      key: "securityAlerts" as const,
                      label: "Security Alerts",
                      text: "Sign-in and account protection warnings.",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.text}</p>
                      </div>

                      <input
                        type="checkbox"
                        checked={prefs[item.key]}
                        onChange={(e) =>
                          setPrefs((prev) => ({ ...prev, [item.key]: e.target.checked }))
                        }
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={savePreferences}
                    disabled={savingPrefs}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingPrefs ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Preferences
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-rose-600">Session</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Sign out this admin session safely from this device.
                </p>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={signOutCurrentSession}
                    disabled={signingOut}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {signingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                    Sign Out
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
