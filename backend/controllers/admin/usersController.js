const usersService = require("../../services/admin/usersService");

const listUsers = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const users = await usersService.getAllUsers(search);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("listUsers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("getUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await usersService.updateUser(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await usersService.deleteUser(req.params.id);

    res.status(200).json({
      success: true,
      data: result,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

module.exports = {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
};