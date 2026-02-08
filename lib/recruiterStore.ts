// lib/recruiterStore.ts

export type RecruiterProfile = {
  companyName: string;
  location: string;
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
  location: "San Francisco, CA",
  isVerified: true,

  about:
    "We are a leading construction firm dedicated to building the future with quality, integrity, and innovation",
  industry: "Construction & Real Estate",
  companySize: "50-100 employees",
  memberSince: "August 2023",
  website: "constructco.com",

  companyAddress: "",
  city: "",
  zipCode: "",

  contactPersonName: "",
  contactEmail: "",
  contactPhoneNumber: "",

  logoBase64: null,
};

// keep it in global memory (doesn’t reset on hot reload)
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
