const db = require("./db");
const prisma = require("../prismaClient");

const isMissingSqlTableError = (error) => {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toLowerCase();
  return code === "42P01" || message.includes("relation") && message.includes("does not exist");
};

const normalizeAudienceRole = (role) => {
  const key = String(role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (key === "RECRUITER" || key === "EMPLOYER") return "RECRUITER";
  return "JOB_SEEKER";
};

async function ensureConversationForApplication({
  applicationId,
  jobId,
  recruiterId,
  jobseekerId,
}) {
  if (!applicationId || !jobId || !recruiterId || !jobseekerId) {
    throw new Error("Invalid conversation participants");
  }

  if (recruiterId === jobseekerId) {
    throw new Error("Cannot create self conversation");
  }

  try {
    const insertSql = `
      INSERT INTO conversations (
        application_id,
        job_id,
        recruiter_id,
        jobseeker_id
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (application_id) DO NOTHING
      RETURNING *
    `;

    const inserted = await db.query(insertSql, [
      applicationId,
      jobId,
      recruiterId,
      jobseekerId,
    ]);

    if (inserted.rows[0]) {
      return inserted.rows[0];
    }

    const existing = await db.query(
      `SELECT * FROM conversations WHERE application_id = $1 LIMIT 1`,
      [applicationId],
    );

    return existing.rows[0] || null;
  } catch (error) {
    if (!isMissingSqlTableError(error)) throw error;

    const existingPrisma = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [jobseekerId, recruiterId],
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existingPrisma) {
      return { id: existingPrisma.id };
    }

    const createdPrisma = await prisma.conversation.create({
      data: {
        participantIds: [jobseekerId, recruiterId],
        lastMessage: "",
        lastMessageTime: "",
        unreadCount: 0,
      },
    });

    return { id: createdPrisma.id };
  }
}

async function getConversationById(id) {
  const sql = `
    SELECT
      c.*,
      j.title AS job_title,
      recruiter."firstName" AS recruiter_first_name,
      recruiter."lastName" AS recruiter_last_name,
      seeker."firstName" AS jobseeker_first_name,
      seeker."lastName" AS jobseeker_last_name
    FROM conversations c
    JOIN "Job" j ON j.id = c.job_id
    JOIN "User" recruiter ON recruiter.id = c.recruiter_id
    JOIN "User" seeker ON seeker.id = c.jobseeker_id
    WHERE c.id = $1
    LIMIT 1
  `;

  const result = await db.query(sql, [id]);
  return result.rows[0] || null;
}

async function getConversationByIdForUser(id, userId) {
  const sql = `
    SELECT
      c.*,
      j.title AS job_title,
      recruiter."firstName" AS recruiter_first_name,
      recruiter."lastName" AS recruiter_last_name,
      seeker."firstName" AS jobseeker_first_name,
      seeker."lastName" AS jobseeker_last_name
    FROM conversations c
    JOIN "Job" j ON j.id = c.job_id
    JOIN "User" recruiter ON recruiter.id = c.recruiter_id
    JOIN "User" seeker ON seeker.id = c.jobseeker_id
    WHERE c.id = $1 AND (c.recruiter_id = $2 OR c.jobseeker_id = $2)
    LIMIT 1
  `;

  const result = await db.query(sql, [id, userId]);
  return result.rows[0] || null;
}

async function getConversationsForUser({ userId }) {
  const sql = `
    SELECT
      c.id,
      c.application_id,
      c.job_id,
      c.recruiter_id,
      c.jobseeker_id,
      c.created_at,
      c.last_message_at,
      j.title AS job_title,
      CASE
        WHEN c.recruiter_id = $1
          THEN COALESCE(NULLIF(TRIM(CONCAT(seeker."firstName", ' ', seeker."lastName")), ''), 'Job Seeker')
        ELSE COALESCE(NULLIF(TRIM(CONCAT(recruiter."firstName", ' ', recruiter."lastName")), ''), 'Recruiter')
      END AS other_user_name,
      CASE
        WHEN c.recruiter_id = $1 THEN c.jobseeker_id
        ELSE c.recruiter_id
      END AS other_user_id,
      latest.message_text AS last_message,
      COALESCE(unread.unread_count, 0)::int AS unread_count
    FROM conversations c
    JOIN "Job" j ON j.id = c.job_id
    JOIN "User" recruiter ON recruiter.id = c.recruiter_id
    JOIN "User" seeker ON seeker.id = c.jobseeker_id
    LEFT JOIN LATERAL (
      SELECT m.message_text, m.created_at
      FROM messages m
      WHERE m.conversation_id = c.id
      ORDER BY m.created_at DESC
      LIMIT 1
    ) latest ON TRUE
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS unread_count
      FROM messages m
      WHERE m.conversation_id = c.id
        AND m.sender_id <> $1
        AND m.is_read = FALSE
    ) unread ON TRUE
    WHERE (c.recruiter_id = $1 OR c.jobseeker_id = $1)
    ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
  `;

  const result = await db.query(sql, [userId]);
  return result.rows;
}

async function getUnreadCountForUser({ userId }) {
  const sql = `
    SELECT COALESCE(COUNT(*), 0)::int AS unread_count
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.sender_id <> $1
      AND m.is_read = FALSE
      AND (c.recruiter_id = $1 OR c.jobseeker_id = $1)
  `;

  const result = await db.query(sql, [userId]);
  return result.rows[0]?.unread_count || 0;
}

async function touchLastMessageAt(conversationId) {
  await db.query(
    `UPDATE conversations SET last_message_at = NOW() WHERE id = $1`,
    [conversationId],
  );
}

module.exports = {
  ensureConversationForApplication,
  getConversationById,
  getConversationByIdForUser,
  getConversationsForUser,
  getUnreadCountForUser,
  touchLastMessageAt,
  normalizeAudienceRole,
};
