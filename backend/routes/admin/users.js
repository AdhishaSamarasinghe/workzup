const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/admin/usersController");

router.get("/", usersController.listUsers);
router.get("/:id", usersController.getUser);
router.put("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;