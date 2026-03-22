const { Pool } = require("pg");
const { loadEnv, getEnv } = require("../config/env");

loadEnv();

const connectionString = getEnv("DATABASE_URL");

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing. Set it in Railway variables for production or backend/.env for local development.",
  );
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
