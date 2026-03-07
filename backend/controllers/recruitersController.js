const { recruiterProfiles, recruiterJobs, recruiterReviews } = require("../data/memoryStore");

const getRecruiterProfile = (req, res) => {
    const { id } = req.params;
    const profile = recruiterProfiles[id];
    if (!profile) {
        return res.status(404).json({ success: false, error: "Recruiter not found" });
    }
    res.json({ success: true, data: profile });
};

const updateRecruiterProfile = (req, res) => {
    const { id } = req.params;
    if (!recruiterProfiles[id]) {
        return res.status(404).json({ success: false, error: "Recruiter not found" });
    }
    // Merge incoming fields into the in-memory object (mutation is fine — in-memory only)
    const allowed = [
        "companyName", "website", "companyAddress", "city", "zipCode",
        "about", "contactPersonName", "contactEmail", "contactPhoneNumber",
        "logoBase64", "logoUrl", "industry", "companySize", "location",
    ];
    allowed.forEach((key) => {
        if (key in req.body) {
            recruiterProfiles[id][key] = req.body[key];
        }
    });
    console.log(`[Update] Recruiter "${id}" profile updated`);
    res.json({ success: true, data: recruiterProfiles[id] });
};

const getRecruiterJobs = (req, res) => {
    const { id } = req.params;
    const jobs = recruiterJobs[id] || [];
    res.json({ success: true, data: jobs });
};

const getRecruiterReviews = (req, res) => {
    const { id } = req.params;
    const reviews = recruiterReviews[id] || [];
    res.json({ success: true, data: reviews });
};

const contactRecruiter = (req, res) => {
    const { id } = req.params;
    const profile = recruiterProfiles[id];
    if (!profile) {
        return res.status(404).json({ success: false, error: "Recruiter not found" });
    }
    console.log(`[Contact] Request sent to recruiter "${profile.companyName}" from`, req.body);
    res.json({ success: true, data: { message: `Message request sent to ${profile.companyName}` } });
};

module.exports = {
    getRecruiterProfile,
    updateRecruiterProfile,
    getRecruiterJobs,
    getRecruiterReviews,
    contactRecruiter,
};
