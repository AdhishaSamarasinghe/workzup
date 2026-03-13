let mockEmployerJobs = [
    {
        id: "job-101",
        title: "Senior React Developer",
        category: "Software Development",
        description: "We are looking for a skilled React Developer to join our team. The ideal candidate will be responsible for building the client-side of our web applications.",
        location: "Remote",
        postedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        jobDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        startTime: "09:00",
        endTime: "17:00",
        hourlyRate: 65,
        status: "PUBLIC",
        requiredSkills: ["React", "TypeScript", "Tailwind CSS"],
        experienceLevel: "Senior",
        newApplicants: 3,
        totalApplicants: 12
    },
    {
        id: "job-102",
        title: "UI/UX Designer",
        category: "Design",
        description: "Looking for an experienced UI/UX Designer to create amazing user experiences for our new platform.",
        location: "New York, NY",
        postedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        jobDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        startTime: "10:00",
        endTime: "18:00",
        hourlyRate: 50,
        status: "DRAFT",
        requiredSkills: ["Figma", "Prototyping", "User Research"],
        experienceLevel: "Mid",
        newApplicants: 0,
        totalApplicants: 0
    },
    {
        id: "job-103",
        title: "Backend Node.js Engineer",
        category: "Software Development",
        description: "Seeking a strong Node.js engineer to build scalable microservices.",
        location: "San Francisco, CA",
        postedDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        jobDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        startTime: "08:00",
        endTime: "16:00",
        hourlyRate: 70,
        status: "PRIVATE",
        requiredSkills: ["Node.js", "Express", "MongoDB"],
        experienceLevel: "Senior",
        newApplicants: 1,
        totalApplicants: 5
    }
];

module.exports = mockEmployerJobs;
