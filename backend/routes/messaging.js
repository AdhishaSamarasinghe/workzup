const express = require("express");
const db = require("../models/db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

function normalizeConversationPair(userA, userB) {
  if (!userA || !userB) {
    throw new Error("Both participants are required.");
  }

  if (userA === userB) {
    throw new Error("Conversation participants must be different.");
  }

  return userA < userB ? [userA, userB] : [userB, userA];
}

async function getConversationForUser(conversationId, userId) {
  const result = await db.query(
    `
      select *
      from public.conversations
      where id = $1
        and (user1_id = $2 or user2_id = $2)
      limit 1
    `,
    [conversationId, userId],
  );

  return result.rows[0] || null;
}

router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const result = await db.query(
      `
        with my_conversations as (
          select c.*
          from public.conversations c
          where c.user1_id = $1 or c.user2_id = $1
        ),
        latest_message as (
          select distinct on (m.conversation_id)
            m.conversation_id,
            m.content,
            m.created_at
          from public.messages m
          order by m.conversation_id, m.created_at desc
        ),
        unread_messages as (
          select
            m.conversation_id,
            count(*)::bigint as unread_count
          from public.messages m
          join my_conversations c on c.id = m.conversation_id
          where m.sender_id <> $1
            and m.is_seen = false
          group by m.conversation_id
        )
        select
          c.id,
          c.user1_id,
          c.user2_id,
          c.created_at,
          case when c.user1_id = $1 then c.user2_id else c.user1_id end as other_user_id,
          coalesce(
            nullif(trim(concat_ws(
              ' ',
              other_user.raw_user_meta_data ->> 'first_name',
              other_user.raw_user_meta_data ->> 'last_name'
            )), ''),
            nullif(other_user.raw_user_meta_data ->> 'full_name', ''),
            nullif(other_user.raw_user_meta_data ->> 'name', ''),
            nullif(other_user.raw_user_meta_data ->> 'company_name', ''),
            other_user.email,
            'Unknown user'
          ) as other_user_name,
          other_user.email as other_user_email,
          coalesce(
            nullif(other_user.raw_user_meta_data ->> 'avatar_url', ''),
            nullif(other_user.raw_user_meta_data ->> 'picture', '')
          ) as other_user_avatar,
          latest_message.content as last_message,
          latest_message.created_at as last_message_at,
          coalesce(unread_messages.unread_count, 0) as unread_count
        from my_conversations c
        left join auth.users other_user
          on other_user.id = case when c.user1_id = $1 then c.user2_id else c.user1_id end
        left join latest_message
          on latest_message.conversation_id = c.id
        left join unread_messages
          on unread_messages.conversation_id = c.id
        order by coalesce(latest_message.created_at, c.created_at) desc
      `,
      [currentUserId],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Messaging conversations error:", error);
    return res.status(500).json({ message: error?.message || "Unable to load conversations." });
  }
});

router.post("/conversations", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const recipientId = req.body?.recipientId;
    const [user1Id, user2Id] = normalizeConversationPair(currentUserId, recipientId);

    const existing = await db.query(
      `
        select *
        from public.conversations
        where user1_id = $1
          and user2_id = $2
        limit 1
      `,
      [user1Id, user2Id],
    );

    if (existing.rows[0]) {
      return res.json(existing.rows[0]);
    }

    const inserted = await db.query(
      `
        insert into public.conversations (user1_id, user2_id)
        values ($1, $2)
        on conflict ((least(user1_id, user2_id)), (greatest(user1_id, user2_id))) do nothing
        returning *
      `,
      [user1Id, user2Id],
    );

    if (inserted.rows[0]) {
      return res.json(inserted.rows[0]);
    }

    const conflicted = await db.query(
      `
        select *
        from public.conversations
        where user1_id = $1
          and user2_id = $2
        limit 1
      `,
      [user1Id, user2Id],
    );

    if (!conflicted.rows[0]) {
      throw new Error("Unable to create conversation.");
    }

    return res.json(conflicted.rows[0]);
  } catch (error) {
    console.error("Messaging get/create conversation error:", error);
    return res.status(500).json({ message: error?.message || "Unable to open conversation." });
  }
});

router.get("/conversations/:id/messages", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const conversationId = req.params.id;
    const conversation = await getConversationForUser(conversationId, currentUserId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const result = await db.query(
      `
        select *
        from public.messages
        where conversation_id = $1
        order by created_at asc
      `,
      [conversationId],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Messaging fetch messages error:", error);
    return res.status(500).json({ message: error?.message || "Unable to load messages." });
  }
});

router.post("/conversations/:id/messages", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const conversationId = req.params.id;
    const content = String(req.body?.content || "").trim();

    if (!content) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    const conversation = await getConversationForUser(conversationId, currentUserId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const result = await db.query(
      `
        insert into public.messages (conversation_id, sender_id, content)
        values ($1, $2, $3)
        returning *
      `,
      [conversationId, currentUserId, content],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Messaging send message error:", error);
    return res.status(500).json({ message: error?.message || "Unable to send your message." });
  }
});

router.patch("/conversations/:id/seen", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const conversationId = req.params.id;
    const conversation = await getConversationForUser(conversationId, currentUserId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const result = await db.query(
      `
        update public.messages
        set is_seen = true
        where conversation_id = $1
          and sender_id <> $2
          and is_seen = false
      `,
      [conversationId, currentUserId],
    );

    return res.json({ updatedCount: result.rowCount || 0 });
  } catch (error) {
    console.error("Messaging mark seen error:", error);
    return res.status(500).json({ message: error?.message || "Unable to update seen state." });
  }
});

module.exports = router;
