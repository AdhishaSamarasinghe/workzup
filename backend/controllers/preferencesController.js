const { preferencesByUserId } = require("../data/memoryStore");

const getPreferences = (req, res) => {
  const { userId } = req.params;

  // If not exist, return default and save it
  if (!preferencesByUserId[userId]) {
    preferencesByUserId[userId] = {
      userId,
      preferredJobTypes: [],
      preferredLocations: [],
      workMode: "Hybrid",
      availability: [],
      salaryMin: 0,
      salaryMax: 0,
      categories: [],
      updatedAt: new Date().toISOString()
    };
  }

  res.json({ success: true, data: preferencesByUserId[userId] });
};

const updatePreferences = (req, res) => {
  const { userId } = req.params;
  const body = req.body;

  // Validation
  const allowedWorkModes = ["Remote", "Onsite", "Hybrid"];

  if (body.preferredJobTypes && (!Array.isArray(body.preferredJobTypes) || body.preferredJobTypes.length > 10)) {
    return res.status(400).json({ success: false, message: "preferredJobTypes must be an array (max 10)" });
  }

  if (body.preferredLocations && (!Array.isArray(body.preferredLocations) || body.preferredLocations.length > 10)) {
    return res.status(400).json({ success: false, message: "preferredLocations must be an array (max 10)" });
  }

  if (body.workMode && !allowedWorkModes.includes(body.workMode)) {
    return res.status(400).json({ success: false, message: "Invalid workMode" });
  }

  if (body.salaryMin !== undefined && body.salaryMax !== undefined) {
    if (Number(body.salaryMax) < Number(body.salaryMin)) {
      return res.status(400).json({ success: false, message: "salaryMax must be greater than or equal to salaryMin" });
    }
  }

  // Update
  const current = preferencesByUserId[userId] || {};

  preferencesByUserId[userId] = {
    ...current,
    userId,
    preferredJobTypes: body.preferredJobTypes ?? current.preferredJobTypes ?? [],
    preferredLocations: body.preferredLocations ?? current.preferredLocations ?? [],
    workMode: body.workMode ?? current.workMode ?? "Hybrid",
    availability: body.availability ?? current.availability ?? [],
    salaryMin: body.salaryMin !== undefined ? Number(body.salaryMin) : (current.salaryMin ?? 0),
    salaryMax: body.salaryMax !== undefined ? Number(body.salaryMax) : (current.salaryMax ?? 0),
    categories: body.categories ?? current.categories ?? [],
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: preferencesByUserId[userId],
    message: "Preferences updated"
  });
};

module.exports = {
  getPreferences,
  updatePreferences
};
