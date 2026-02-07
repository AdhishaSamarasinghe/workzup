"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function EditRecruiterPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm = {
    companyName: "",
    website: "",
    companyAddress: "",
    city: "",
    zipCode: "",
    companyDescription: "",
    contactPersonName: "",
    contactEmail: "",
    contactPhoneNumber: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form data:", formData);
  };

  const handleCancel = () => {
    // Reset form fields and remove uploaded preview
    setFormData(initialForm);
    setLogoPreview(null);
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch (e) {
        // ignore (some browsers may restrict programmatic clear)
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-bg py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1F2937]">
              Edit Business Profile
            </h1>
            <p className="mt-1 text-sm text-muted">
              Update your company&apos;s information for job seekers.
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit}>
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              {/* Company Logo Section */}
              <div className="mb-8">
                <h2 className="mb-4 text-base font-semibold text-[#1F2937]">
                  Company Logo
                </h2>
                <div className="flex items-start gap-4">
                  {/* Logo Preview */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#E5E7EB]">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Company logo preview"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-muted text-xs"></span>
                      </div>
                    )}
                  </div>

                  {/* Upload Instructions */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted">
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
                      className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#E5E7EB] bg-card px-4 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:bg-[#F9FAFB]"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Upload new logo
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Details Section */}
              <div className="mb-8">
                <h2 className="mb-4 text-base font-semibold text-[#1F2937]">
                  Company Details
                </h2>
                <div className="grid gap-4">
                  {/* Company Name & Website */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="companyName"
                        className="mb-1.5 block text-sm font-medium text-[#1F2937]"
                      >
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] placeholder-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="website"
                        className="mb-1.5 block text-sm font-medium text-[#1F2937]"
                      >
                        Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] placeholder-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Company Address */}
                  <div>
                    <label
                      htmlFor="companyAddress"
                      className="mb-1.5 block text-sm font-medium text-[#1F2937]"
                    >
                      Company Address
                    </label>
                    <input
                      type="text"
                      id="companyAddress"
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] placeholder-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  {/* City & Zip Code */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="city"
                        className="mb-1.5 block text-sm font-medium text-[#1F2937]"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] placeholder-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="zipCode"
                        className="mb-1.5 block text-sm font-medium text-[#1F2937]"
                      >
                        Zip Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] placeholder-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Company Description */}
                  <div>
                    <label
                      htmlFor="companyDescription"
                      className="mb-1.5 block text-sm font-medium text-[#1F2937]"
                    >
                      Company Description
                    </label>
                    <textarea
                      id="companyDescription"
                      name="companyDescription"
                      value={formData.companyDescription}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] placeholder-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="mb-8">
                <h2 className="mb-4 text-base font-semibold text-[#1F2937]">
                  Contact Information
                </h2>
                <div className="grid gap-4">
                  {/* Contact Person Name & Email */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contactPersonName"
                        className="mb-1.5 block text-sm font-medium text-[#1F2937]"
                      >
                        Contact Person Name
                      </label>
                      <input
                        type="text"
                        id="contactPersonName"
                        name="contactPersonName"
                        value={formData.contactPersonName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] placeholder-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contactEmail"
                        className="mb-1.5 block text-sm font-medium text-[#1F2937]"
                      >
                        Contact Email
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] placeholder-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Contact Phone Number */}
                  <div>
                    <label
                      htmlFor="contactPhoneNumber"
                      className="mb-1.5 block text-sm font-medium text-[#1F2937]"
                    >
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      id="contactPhoneNumber"
                      name="contactPhoneNumber"
                      value={formData.contactPhoneNumber}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-card px-4 py-2.5 text-sm text-[#1F2937] placeholder-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg px-6 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#1F2937]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
