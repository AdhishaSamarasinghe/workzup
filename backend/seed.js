const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function cleanDatabase() {
    console.log('🧹 Cleaning Database...');
    // Delete all users. Due to onDelete: Cascade in the schema, 
    // this drops profiles, companies, jobs, applications, wallets, payments, etc.
    await prisma.user.deleteMany();
    await prisma.skill.deleteMany();
}

async function seed() {
    await cleanDatabase();

    console.log('🌱 Starting Database Seeding...');
    const password = await bcrypt.hash('password123', 10);

    // 1. Create Users & Wallets
    console.log('1️⃣ Creating Users (Admin, Recruiter, Jobseeker)...');
    const admin = await prisma.user.create({
        data: {
            name: 'System Admin',
            email: 'admin@workzup.com',
            password,
            role: 'ADMIN',
            isEmailVerified: true,
            wallet: { create: { balance: 0 } }
        }
    });

    const recruiter = await prisma.user.create({
        data: {
            name: 'Sarah (Recruiter)',
            email: 'sarah@techcorp.com',
            password,
            role: 'RECRUITER',
            isEmailVerified: true,
            wallet: { create: { balance: 1000 } }, // Recruiter loaded with cash
            subscription: { create: { planType: 'PREMIUM' } }
        }
    });

    const jobseeker = await prisma.user.create({
        data: {
            name: 'Alex (Jobseeker)',
            email: 'alex@dev.com',
            password,
            role: 'JOBSEEKER',
            isEmailVerified: true,
            wallet: { create: { balance: 50 } },
            profile: {
                create: {
                    bio: 'Fullstack developer looking for gigs',
                    location: 'Remote'
                }
            }
        },
        include: { profile: true } // Return profile to use ID if needed
    });

    // 2. Create Skills
    console.log('2️⃣ Creating Skills...');
    const reactSkill = await prisma.skill.create({ data: { name: 'React' } });
    const nodeSkill = await prisma.skill.create({ data: { name: 'Node.js' } });

    // 3. Create Company & Job
    console.log('3️⃣ Creating Company and Jobs...');
    const company = await prisma.company.create({
        data: {
            name: 'TechCorp Inc.',
            description: 'A leading tech firm',
            ownerId: recruiter.id,
            isVerified: true
        }
    });

    const job = await prisma.job.create({
        data: {
            title: 'Senior Frontend Developer',
            description: 'We need a React expert to build our dashboard.',
            salary: 1500,
            category: 'Engineering',
            jobType: 'Contract',
            companyId: company.id,
            jobSkills: {
                create: [
                    { skillId: reactSkill.id },
                    { skillId: nodeSkill.id }
                ]
            }
        },
        include: { jobSkills: { include: { skill: true } } }
    });

    // Track a JobView event
    await prisma.jobView.create({
        data: {
            jobId: job.id,
            userId: jobseeker.id,
            viewerIp: '192.168.1.1'
        }
    });

    // 4. Create Application & Messages
    console.log('4️⃣ Creating Application Flow...');
    const application = await prisma.application.create({
        data: {
            userId: jobseeker.id,
            jobId: job.id,
            status: 'ACCEPTED',
            messages: {
                create: [
                    { senderId: jobseeker.id, content: 'Hi! I am interested in this job.' },
                    { senderId: recruiter.id, content: 'Great! We accept your proposal.' }
                ]
            }
        }
    });

    // 5. Escrow Payment Flow
    console.log('5️⃣ Creating Escrow Payment & Ledgers...');
    const payment = await prisma.payment.create({
        data: {
            applicationId: application.id,
            payerId: recruiter.id,
            receiverId: jobseeker.id,
            amount: 1500,
            platformFee: 150, // 10% fee
            netAmount: 1350,
            paymentMethod: 'CARD',
            paymentStatus: 'HELD_IN_ESCROW',
            gatewayProvider: 'PAYHERE',
            transactions: {
                create: [
                    {
                        userId: recruiter.id,
                        type: 'ESCROW_HOLD',
                        amount: 1500,
                        description: 'Funds locked in escrow for Job: Senior Frontend Developer'
                    }
                ]
            }
        }
    });

    // 6. Raise a Dispute
    console.log('6️⃣ Raising a Dispute & Audit Log...');
    const dispute = await prisma.dispute.create({
        data: {
            paymentId: payment.id,
            raisedById: recruiter.id,
            reason: 'The delivered code failed tests.',
        }
    });

    await prisma.auditLog.create({
        data: {
            adminId: admin.id,
            action: 'REVIEWED_DISPUTE',
            targetPaymentId: payment.id
        }
    });

    // 7. Test Notifications & Reviews
    console.log('7️⃣ Triggering System Notifications...');
    await prisma.notification.create({
        data: {
            userId: recruiter.id,
            type: 'PAYMENT_RECEIVED',
            content: 'Escrow payment processed successfully.',
            linkId: payment.id
        }
    });

    await prisma.review.create({
        data: {
            reviewerId: recruiter.id,
            targetId: jobseeker.id,
            applicationId: application.id,
            rating: 4,
            comment: 'Good developer, but tests were a bit flaky.'
        }
    });

    console.log('✅ SEEDING COMPLETE! Fetching the constructed Job object:\n');

    // Verify by fetching the deeply nested job
    const verifiedJob = await prisma.job.findUnique({
        where: { id: job.id },
        include: {
            company: { select: { name: true, owner: { select: { name: true } } } },
            jobSkills: { include: { skill: true } },
            applications: {
                include: {
                    user: { select: { name: true } },
                    payment: {
                        include: {
                            dispute: true,
                            transactions: true
                        }
                    }
                }
            },
            views: true
        }
    });

    console.dir(verifiedJob, { depth: null, colors: true });
}

seed()
    .catch((e) => {
        console.error('❌ Seeding Failed!');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
