// Simulated mock data store for user settings
let userSettingsDb = {
    user: {
        name: "Alex Doe",
        title: "Product Designer",
        bio: "Passionate about creating seamless user experiences and connecting talent with great opportunities.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&auto=format&fit=crop",
        phone: "+94 771234567",
        location: "Sri Lanka",
        birthday: "1990-01-01"
    },
    profileVisibility: true,
    newJobMatches: true,
    applicationUpdates: false,
    marketingEmails: false,
    securityEmails: true,
    searchEngineIndexing: false,
    theme: "light",
    language: "English (United States)",
    ratings: {
        overallRating: 4.9,
        workQualities: {
            reliability: 4.8,
            technicalSkill: 4.9,
            communication: 5.0,
            punctuality: 4.7
        },
        pastExperiences: [
            {
                id: 1,
                company: "Tech Corp",
                role: "Senior Designer",
                rating: 5,
                feedback: "Excellent work, delivered on time."
            },
            {
                id: 2,
                company: "Design Studio",
                role: "Contract Designer",
                rating: 4.8,
                feedback: "Very creative and communicative."
            }
        ]
    }
};

exports.getUserSettings = (req, res) => {
    try {
        // Typically parse req.user.id to find specific user settings from DB
        res.status(200).json(userSettingsDb);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch settings" });
    }
};

exports.updateUserSettings = (req, res) => {
    try {
        const { section, data } = req.body;

        if (!section || !data) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (section === "profile") {
            userSettingsDb.user = {
                ...userSettingsDb.user,
                name: data.name,
                title: data.title,
                bio: data.bio,
                avatar: data.avatar,
                phone: data.phone,
                location: data.location,
                birthday: data.birthday
            };
        } else if (section === "password") {
            // Password logic goes here
            if (data.currentPassword === data.newPassword) {
                return res.status(400).json({ error: "New password cannot be the same as current password" });
            }
        } else if (section === "preferences" || section === "privacy") {
            if (data.theme !== undefined) userSettingsDb.theme = data.theme;
            if (data.language !== undefined) userSettingsDb.language = data.language;
            if (data.searchEngineIndexing !== undefined) userSettingsDb.searchEngineIndexing = data.searchEngineIndexing;
            if (data.profileVisibility !== undefined) userSettingsDb.profileVisibility = data.profileVisibility;
        } else {
            // Update root settings
            if (data.profileVisibility !== undefined) userSettingsDb.profileVisibility = data.profileVisibility;
            if (data.jobMatches !== undefined) userSettingsDb.newJobMatches = data.jobMatches;
            if (data.appUpdates !== undefined) userSettingsDb.applicationUpdates = data.appUpdates;
            if (data.marketingEmails !== undefined) userSettingsDb.marketingEmails = data.marketingEmails;
            if (data.securityEmails !== undefined) userSettingsDb.securityEmails = data.securityEmails;
            if (data.searchEngineIndexing !== undefined) userSettingsDb.searchEngineIndexing = data.searchEngineIndexing;
        }

        res.status(200).json({ message: "Settings updated successfully", settings: userSettingsDb });
    } catch (error) {
        res.status(500).json({ error: "Failed to update settings" });
    }
};
