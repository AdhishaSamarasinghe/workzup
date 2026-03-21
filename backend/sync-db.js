const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding verificationStatus to User...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING'`);
    
    console.log("Adding verificationNotes to User...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT`);
    
    console.log("Adding riskLevel to Application...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "riskLevel" TEXT`);
    
    console.log("Adding riskIndicator to Application...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "riskIndicator" TEXT`);
    
    console.log("Creating Report table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Report" (
          "id" TEXT NOT NULL,
          "reporterId" TEXT NOT NULL,
          "reportedType" TEXT NOT NULL,
          "reportedId" TEXT NOT NULL,
          "reportedName" TEXT,
          "reason" TEXT NOT NULL,
          "description" TEXT,
          "status" TEXT NOT NULL DEFAULT 'Open',
          "priority" TEXT NOT NULL DEFAULT 'Medium',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log("Adding Report foreign key constraint...");
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'Report_reporterId_fkey'
        ) THEN
          ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    console.log("Database successfully synced!");
  } catch (err) {
    console.error("Error syncing DB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
