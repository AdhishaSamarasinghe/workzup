require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing connection to: " + process.env.DATABASE_URL);
    const users = await prisma.user.findMany({ take: 1 });
    console.log("Connection successful. Found users:", users.length);
  } catch (error) {
    console.error("Database Connection Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
