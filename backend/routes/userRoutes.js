const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/settings", userController.getUserSettings);
router.post("/settings", userController.updateUserSettings);

module.exports = router;
