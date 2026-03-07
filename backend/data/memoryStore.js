const nowIso = new Date().toISOString();

const users = [
  {
    id: "current-user-123",
    role: "JOB_SEEKER",
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

const conversations = [
  {
    id: "1",
    type: "direct",
    participants: [users[0], users[1]],
    participant: users[1],
    lastMessage: "Hello, are you available for the job?",
    lastMessageTime: "10:30 AM",
    unreadCount: 1,
    isArchived: false,
    isPinned: false,
    createdAt: nowIso,
  },
];

const messages = [
  {
    id: "m1",
    conversationId: "1",
    senderId: "recruiter-1",
    content: "Hello, are you available for the job?",
    text: "Hello, are you available for the job?",
    replyToId: null,
    isRead: false,
    isEdited: false,
    isDeleted: false,
    timestamp: "10:30 AM",
    createdAt: nowIso,
  },
  {
    id: "m2",
    conversationId: "1",
    senderId: "current-user-123",
    content: "Yes — I’m interested. What time should I be there?",
    text: "Yes — I’m interested. What time should I be there?",
    replyToId: null,
    isRead: true,
    isEdited: false,
    isDeleted: false,
    timestamp: "10:32 AM",
    createdAt: nowIso,
  },
];

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
