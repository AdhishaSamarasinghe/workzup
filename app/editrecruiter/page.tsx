"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";

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

  // load existing profile and prefill
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/recruiter-profile", { cache: "no-store" });
        const json = await res.json();
        if (!json.ok) throw new Error("Failed to load");

        const d = json.data;

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

        setLogoPreview(d.logoBase64 ?? null);
      } catch {
        setError("Could not load recruiter profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    try {
      const payload = {
        companyName: formData.companyName,
        website: formData.website,
        companyAddress: formData.companyAddress,
        city: formData.city,
        zipCode: formData.zipCode,
        about: formData.about,
        contactPersonName: formData.contactPersonName,
        contactEmail: formData.contactEmail,
        contactPhoneNumber: formData.contactPhoneNumber,
        logoBase64: formData.logoBase64,
      };

      const res = await fetch("/api/recruiter-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Save failed");

      router.push("/recruiterprofile");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => router.push("/recruiterprofile");

  if (loading) {
    return (
      <div className="min-h-screen bg-bg grid place-items-center">
        <p className="text-muted">Loading edit form...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1F2937]">Edit Business Profile</h1>
          <p className="mt-1 text-sm text-muted">Update your company&apos;s information for job seekers.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            {/* Logo */}
            <div className="mb-8">
              <h2 className="mb-4 text-base font-semibold text-[#1F2937]">Company Logo</h2>

              <div className="flex items-start gap-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#E5E7EB]">
                  {logoPreview ? (
                    <Image src={logoPreview} alt="Company logo preview" width={96} height={96} className="h-full w-full object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted">
                    Update a new logo. We recommend a square image, at least 200×200px, in PNG or JPG format.
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
                    className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#E5E7EB] bg-card px-4 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:bg-[#F9FAFB]"
                  >
                    Upload new logo
                  </button>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="mb-8">
              <h2 className="mb-4 text-base font-semibold text-[#1F2937]">Company Details</h2>

              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">Website</label>
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
                  <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">Company Address</label>
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
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">Zip Code</label>
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
                  <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">Company Description</label>
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
            <div className="mb-8">
              <h2 className="mb-4 text-base font-semibold text-[#1F2937]">Contact Information</h2>

              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">Contact Person Name</label>
                    <input
                      type="text"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">Contact Email</label>
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
                  <label className="mb-1.5 block text-sm font-medium text-[#1F2937]">Contact Phone Number</label>
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

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg px-6 py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#1F2937]"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
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
