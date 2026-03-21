"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Contact, Save } from "lucide-react";
import { fetchApi } from "@/lib/api";
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
  const [activeTab, setActiveTab] = useState<"company" | "contact">("company");
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
        const json = await fetchApi<{ profile: RecruiterProfile & { logoUrl?: string | null } }>("/api/recruiter/profile");

        if (!json.success) throw new Error(json.error || "Failed to load");

        const d = json.data?.profile;
        if (!d) throw new Error("Profile data not found");
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
        setError(
          msg.includes("404")
            ? "Recruiter profile endpoint was not found. Please check backend routes."
            : "Could not load recruiter profile. Please check backend connection.",
        );
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
      console.log("[EditRecruiter] Saving profile to /api/recruiter/profile");

      const json = await fetchApi<{ message: string }>("/api/recruiter/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

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
      <div className="min-h-screen bg-slate-50 grid place-items-center pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Loading recruiter settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/recruiterprofile"
            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-[#6b8bff] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Profile
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage your business profile and recruiter contact details.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sticky top-24">
              <button
                onClick={() => setActiveTab("company")}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center transition-colors ${
                  activeTab === "company"
                    ? "bg-blue-50 text-[#6b8bff]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Building2
                  className={`w-5 h-5 mr-3 ${
                    activeTab === "company" ? "text-[#6b8bff]" : "text-slate-400"
                  }`}
                />
                Company Profile
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center transition-colors mt-1 ${
                  activeTab === "contact"
                    ? "bg-blue-50 text-[#6b8bff]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Contact
                  className={`w-5 h-5 mr-3 ${
                    activeTab === "contact" ? "text-[#6b8bff]" : "text-slate-400"
                  }`}
                />
                Contact Details
              </button>
            </div>
          </div>

          <div className="flex-1 max-w-2xl">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 font-medium">
                Profile saved successfully.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {activeTab === "company" && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Company Profile</h2>
                  <p className="text-slate-500 mb-6 text-sm">
                    Update your company brand and business information for job seekers.
                  </p>

                  <div className="mb-8">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                      Company Logo
                    </h3>

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
                        <p className="text-xs text-slate-500 sm:text-sm">
                          Upload a square logo (PNG or JPG), recommended size 200x200px or larger.
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
                          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          Upload New Logo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                          Company Name
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                          Website
                        </label>
                        <input
                          type="text"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                        Company Address
                      </label>
                      <input
                        type="text"
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                        Company Description
                      </label>
                      <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center gap-2"
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "contact" && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Contact Details</h2>
                  <p className="text-slate-500 mb-6 text-sm">
                    Set the recruiter contact info that applicants and team members can use.
                  </p>

                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                          Contact Person Name
                        </label>
                        <input
                          type="text"
                          name="contactPersonName"
                          value={formData.contactPersonName}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        name="contactPhoneNumber"
                        value={formData.contactPhoneNumber}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#6b8bff] focus:ring-2 focus:ring-blue-50 transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center gap-2"
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
