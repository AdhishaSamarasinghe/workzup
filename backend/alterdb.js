const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding paymentMethod column...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentMethod" text DEFAULT 'CARD';`);
    console.log("Successfully added paymentMethod column.");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
