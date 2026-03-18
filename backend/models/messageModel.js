const db = require("./db");

async function getMessagesByConversationId(conversationId) {
  const sql = `
    SELECT
      id,
      conversation_id,
      sender_id,
      message_text,
      is_read,
      created_at
    FROM messages
    WHERE conversation_id = $1
    ORDER BY created_at ASC
  `;

  const result = await db.query(sql, [conversationId]);
  return result.rows;
}

async function createMessage({ conversationId, senderId, messageText }) {
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const inserted = await client.query(
      `
        INSERT INTO messages (
          conversation_id,
          sender_id,
          message_text
        )
        VALUES ($1, $2, $3)
        RETURNING id, conversation_id, sender_id, message_text, is_read, created_at
      `,
      [conversationId, senderId, messageText],
    );

    await client.query(
      `UPDATE conversations SET last_message_at = NOW() WHERE id = $1`,
      [conversationId],
    );

    await client.query("COMMIT");
    return inserted.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function markConversationRead({ conversationId, currentUserId }) {
  const sql = `
    UPDATE messages
    SET is_read = TRUE
    WHERE conversation_id = $1
      AND sender_id <> $2
      AND is_read = FALSE
  `;

  const result = await db.query(sql, [conversationId, currentUserId]);
  return result.rowCount || 0;
}

module.exports = {
  getMessagesByConversationId,
  createMessage,
  markConversationRead,
};
