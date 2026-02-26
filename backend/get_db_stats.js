const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to database...");

        const counts = await Promise.all([
            prisma.user.count(),
            prisma.profile.count(),
            prisma.company.count(),
            prisma.job.count(),
            prisma.application.count(),
            prisma.message.count(),
            prisma.wallet.count(),
            prisma.payment.count(),
            prisma.transactionLog.count(),
            prisma.payoutRequest.count(),
            prisma.auditLog.count()
        ]);

        console.log("Database Statistics (Production Layout):");
        console.log(`- Users: ${counts[0]}`);
        console.log(`- Profiles: ${counts[1]}`);
        console.log(`- Companies: ${counts[2]}`);
        console.log(`- Jobs: ${counts[3]}`);
        console.log(`- Applications: ${counts[4]}`);
        console.log(`- Messages: ${counts[5]}`);
        console.log(`- Wallets: ${counts[6]}`);
        console.log(`- Payments: ${counts[7]}`);
        console.log(`- TransactionLogs: ${counts[8]}`);
        console.log(`- PayoutRequests: ${counts[9]}`);
        console.log(`- AuditLogs: ${counts[10]}`);
    } catch (e) {
        console.error("Failed to query the database. The schema update might not have been applied or the connection string is wrong.");
        console.error(e);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
