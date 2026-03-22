const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const jobs = await prisma.job.findMany();
    console.log("Jobs found in database:", jobs.length);
    if (jobs.length > 0) {
        console.log("First job:", jobs[0].title);
    }
}
main().finally(() => prisma.$disconnect());
