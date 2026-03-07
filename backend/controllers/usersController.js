const { users } = require('../data/memoryStore');
const crypto = require('crypto');

// POST /api/users
// Create a user
const createUser = (req, res) => {
    const { name, email, ...otherData } = req.body;

    const newUser = {
        id: crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString() + Math.random().toString(36).substring(7)),
        name,
        email,
        ...otherData,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    res.status(201).json({ success: true, data: newUser });
};

// GET /api/users
// Return all users
const getAllUsers = (req, res) => {
    res.status(200).json({ success: true, data: users });
};

module.exports = {
    createUser,
    getAllUsers
};
