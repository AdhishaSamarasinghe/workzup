// Simple in-memory arrays to act like a fake database.
// All data resets when the backend server restarts.

const nowIso = new Date().toISOString();

// Seed a sample chat so the Messaging page has something to show.
const users = [
  {
    id: "current-user-123",
    role: "Job Seeker",
    name: "Viraj",
    email: "viraj@workzup.com",
    avatar: "/avatars/default.svg",
    isOnline: true,
    lastSeen: nowIso,
  },
  {
    id: "recruiter-1",
    name: "John Recruiter",
    avatar: "/logo_main.png",
    role: "Recruiter",
    isOnline: true,
    lastSeen: nowIso,
  },
];

const preferencesByUserId = {
  "current-user-123": {
    userId: "current-user-123",
    preferredJobTypes: ["Part-time", "Remote"],
    preferredLocations: ["Colombo"],
    workMode: "Remote",
    availability: ["Weekdays"],
    salaryMin: 40000,
    salaryMax: 60000,
    categories: ["Retail", "IT Support"],
    updatedAt: new Date().toISOString(),
  },
};

const recruiterProfiles = {
  default: {
    id: "default",
    companyName: "Construct Co.",
    verified: true,
    location: "San Francisco, CA",
    tagline: "Verified Employer",
    logoUrl: "/logo_main.png",
    logoBase64: null,
    about:
      "We are a leading construction firm dedicated to building the future with quality, integrity, and innovation.",
    industry: "Construction & Real Estate",
    companySize: "50-100 employees",
    memberSince: "August 2023",
    website: "constructco.com",
    // Edit-form specific fields
    companyAddress: "123 Builder Street",
    city: "San Francisco",
    zipCode: "94103",
    contactPersonName: "James Carter",
    contactEmail: "james@constructco.com",
    contactPhoneNumber: "+1 415-555-0198",
  },
};

const recruiterJobs = {
  default: [
    {
      id: "j1",
      title: "General Laborer",
      postedOn: "Oct 26, 2023",
      status: "Completed",
      applicants: 35,
      icon: "tool",
    },
    {
      id: "j2",
      title: "Warehouse Associate",
      postedOn: "Sep 15, 2023",
      status: "Completed",
      applicants: 52,
      icon: "home",
    },
    {
      id: "j3",
      title: "Delivery Driver",
      postedOn: "Aug 02, 2023",
      status: "Expired",
      applicants: 18,
      icon: "truck",
    },
  ],
};

const recruiterReviews = {
  default: [
    {
      id: "r1",
      reviewerName: "Nimal",
      rating: 5,
      date: "Jan 2024",
      comment: "Great communication and fast hiring process.",
    },
    {
      id: "r2",
      reviewerName: "Kavindu",
      rating: 4,
      date: "Dec 2023",
      comment: "Professional recruiter, job details were clear.",
    },
  ],
};

const jobs = [];
const conversations = [];
const messages = [];

module.exports = {
  users,
  preferencesByUserId,
  recruiterProfiles,
  recruiterJobs,
  recruiterReviews,
  jobs,
  messages,
  conversations,
};
