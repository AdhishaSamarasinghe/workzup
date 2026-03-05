const { users } = require("../data/memoryStore");

const getProfile = (req, res) => {
    const { userId } = req.params;
    const user = users.find((u) => u.id === userId);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
};

const updateProfile = (req, res) => {
    const { userId } = req.params;
    const { name, bio, location, avatar } = req.body;

    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields
    if (name !== undefined) users[userIndex].name = name;
    if (bio !== undefined) users[userIndex].bio = bio;
    if (location !== undefined) users[userIndex].location = location;
    if (avatar !== undefined) users[userIndex].avatar = avatar;

    res.json({ success: true, data: users[userIndex] });
};

module.exports = {
    getProfile,
    updateProfile
};
