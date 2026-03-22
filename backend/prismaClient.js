const { PrismaClient } = require('@prisma/client');
const { loadEnv, getEnv } = require('./config/env');

loadEnv();

const databaseUrl = getEnv('DATABASE_URL');

if (!databaseUrl) {
	throw new Error(
		'DATABASE_URL is missing. Set DATABASE_URL in Railway variables for production or backend/.env for local development.',
	);
}

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: databaseUrl,
		},
	},
});

module.exports = prisma;
