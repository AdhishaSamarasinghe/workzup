const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// POST /api/users - Create a user
router.post('/', usersController.createUser);

// GET /api/users - Return all users
router.get('/', usersController.getAllUsers);

module.exports = router;
