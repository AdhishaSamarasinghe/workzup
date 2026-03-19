const prisma = require("../../prismaClient");

const getAllUsers = async (search = "") => {
  const q = String(search).trim();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      isVerified: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed User",
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
};

const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      seekerProfile: true,
      companies: true,
    },
  });
};

const updateUser = async (id, data) => {
  const allowedData = {};

  if (typeof data.firstName !== "undefined") allowedData.firstName = data.firstName;
  if (typeof data.lastName !== "undefined") allowedData.lastName = data.lastName;
  if (typeof data.role !== "undefined") allowedData.role = data.role;
  if (typeof data.isVerified !== "undefined") allowedData.isVerified = data.isVerified;
  if (typeof data.isBanned !== "undefined") allowedData.isBanned = data.isBanned;

  return prisma.user.update({
    where: { id },
    data: allowedData,
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      isVerified: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deleteUser = async (id) => {
  return prisma.user.update({
    where: { id },
    data: {
      isBanned: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      isVerified: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};