console.log("ADMIN USERS ROUTE FILE LOADED:", __filename);

const express = require("express");
const router = express.Router();

const authenticateToken = require("../../middleware/authenticateToken");
const requireAdmin = require("../../middleware/requireAdmin");
const usersController = require("../../controllers/admin/usersController");

router.get("/", authenticateToken, requireAdmin, usersController.listUsers);
router.get("/:id", authenticateToken, requireAdmin, usersController.getUser);
router.put("/:id", authenticateToken, requireAdmin, usersController.updateUser);
router.delete("/:id", authenticateToken, requireAdmin, usersController.deleteUser);

module.exports = router;

console.log("MAIN USERS ROUTE FILE LOADED:", __filename);