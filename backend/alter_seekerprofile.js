const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding paymentDetails to SeekerProfile...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "SeekerProfile" ADD COLUMN IF NOT EXISTS "paymentDetails" JSONB;`);
    console.log("Successfully added paymentDetails column.");
  } catch (error) {
    console.error("Failed to alter table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
