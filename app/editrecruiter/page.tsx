"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchRecruiter } from "@/lib/api";
import type { ChangeEvent, FormEvent } from "react";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

type RecruiterProfile = {
  companyName: string;
  website: string;
  companyAddress: string;
  city: string;
  zipCode: string;
  about: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  logoBase64: string | null;
};

export default function EditRecruiterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<RecruiterProfile>({
    companyName: "",
    website: "",
    companyAddress: "",
    city: "",
    zipCode: "",
    about: "",
    contactPersonName: "",
    contactEmail: "",
    contactPhoneNumber: "",
    logoBase64: null,
  });

  // Load existing profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        console.log("[EditRecruiter] Loading profile from backend...");
        const json = await fetchRecruiter("default");

        if (!json.success) throw new Error(json.error || "Failed to load");

        const d = json.data;
        console.log("[EditRecruiter] Profile loaded:", d);

        setFormData({
          companyName: d.companyName ?? "",
          website: d.website ?? "",
          companyAddress: d.companyAddress ?? "",
          city: d.city ?? "",
          zipCode: d.zipCode ?? "",
          about: d.about ?? "",
          contactPersonName: d.contactPersonName ?? "",
          contactEmail: d.contactEmail ?? "",
          contactPhoneNumber: d.contactPhoneNumber ?? "",
          logoBase64: d.logoBase64 ?? null,
        });

        if (d.logoBase64) setLogoPreview(d.logoBase64);
        else if (d.logoUrl) setLogoPreview(d.logoUrl);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("[EditRecruiter] Load error:", msg);
        setError("Could not load recruiter profile. Make sure the backend is running on port 5000.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      setError("Logo too large. Please use an image under 800KB.");
      return;
    }

    const toBase64 = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

    try {
      setError(null);
      const base64 = await toBase64(file);
      setLogoPreview(base64);
      setFormData((prev) => ({ ...prev, logoBase64: base64 }));
    } catch {
      setError("Failed to read the image file.");
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (!BASE) throw new Error("NEXT_PUBLIC_BACKEND_URL is not set in .env.local");

      const url = `${BASE}/recruiters/default`;
      console.log(`[EditRecruiter] Saving to ${url}`);

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Save failed");

      console.log("[EditRecruiter] Saved successfully:", json.data);
      setSuccess(true);
      setTimeout(() => {
        router.push("/recruiterprofile");
        router.refresh();
      }, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      console.error("[EditRecruiter] Save error:", msg);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => router.push("/recruiterprofile");

  if (loading) {
    return (
      <div className="min-h-screen bg-bg grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mx-auto mb-3" />
          <p className="text-muted text-sm">Loading edit form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1F2937]">
            Edit Business Profile
          </h1>
          <p className="mt-1 text-sm text-muted">
            Update your company&apos;s information for job seekers.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 font-medium">
            ✓ Profile saved! Redirecting to profile page...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-card p-4 shadow-sm sm:p-6">
            {/* Logo */}
            <div className="mb-6 sm:mb-8">
              <h2 className="mb-3 text-base font-semibold text-[#1F2937] sm:mb-4">
                Company Logo
              </h2>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#E5E7EB] sm:h-24 sm:w-24">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Company logo preview"
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs text-center p-2">
                      No logo
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                  <p className="text-xs text-muted sm:text-sm">
                    Update a new logo. We recommend a square image, at least
                    200×200px, in PNG or JPG format.
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png,image/jpeg"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#E5E7EB] bg-card px-3 py-1.5 text-xs font-medium text-[#1F2937] transition-colors hover:bg-[#F9FAFB] sm:px-4 sm:py-2 sm:text-sm"
                  >
                    Upload new logo
                  </button>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="mb-6 sm:mb-8">
              <h2 className="mb-3 text-base font-semibold text-[#1F2937] sm:mb-4">
                Company Details
              </h2>

              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">
                    Company Address
                  </label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">
                    Company Description
                  </label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-6 sm:mb-8">
              <h2 className="mb-3 text-base font-semibold text-[#1F2937] sm:mb-4">
                Contact Information
              </h2>

              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">
                      Contact Person Name
                    </label>
                    <input
                      type="text"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactPhoneNumber"
                    value={formData.contactPhoneNumber}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full rounded-lg px-6 py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#1F2937] sm:w-auto"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60 sm:w-auto"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
