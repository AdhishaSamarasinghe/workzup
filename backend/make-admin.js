const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error("Please provide an email address. Usage: node make-admin.js <email>");
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`Success! User ${email} is now an ADMIN.`);
    } catch (error) {
        console.error("Error making user admin:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
