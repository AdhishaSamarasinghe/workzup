// lib/recruiterStore.ts

export type RecruiterProfile = {
  companyName: string;
  isVerified: boolean;

  about: string;
  industry: string;
  companySize: string;
  memberSince: string;
  website: string;

  companyAddress: string;
  city: string;
  zipCode: string;

  contactPersonName: string;
  contactEmail: string;
  contactPhoneNumber: string;

  logoBase64: string | null;
};

const defaultRecruiter: RecruiterProfile = {
  companyName: "Construct Co.",
  isVerified: true,

  about:
    "We are a leading construction firm dedicated to building the future with quality, integrity, and innovation",
  industry: "Construction & Real Estate",
  companySize: "50-100 employees",
  memberSince: "August 2023",
  website: "constructco.com",

  // ✅ These will control the "location" text on profile page
  companyAddress: "123 Market Street",
  city: "San Francisco, CA",
  zipCode: "94103",

  contactPersonName: "",
  contactEmail: "",
  contactPhoneNumber: "",

  logoBase64: null,
};

declare global {
  // eslint-disable-next-line no-var
  var __recruiterProfile: RecruiterProfile | undefined;
}

export function getRecruiterProfile(): RecruiterProfile {
  if (!globalThis.__recruiterProfile) globalThis.__recruiterProfile = defaultRecruiter;
  return globalThis.__recruiterProfile;
}

export function updateRecruiterProfile(patch: Partial<RecruiterProfile>): RecruiterProfile {
  const current = getRecruiterProfile();
  globalThis.__recruiterProfile = { ...current, ...patch };
  return globalThis.__recruiterProfile;
}
