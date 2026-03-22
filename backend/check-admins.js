const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        console.log('Total Admins:', admins.length);
        admins.forEach(a => console.log(' ->', a.email, a.id));

        const jobs = await prisma.job.count();
        console.log('Total Jobs:', jobs);
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
