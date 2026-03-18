const { getIo } = require("../socket");
const conversationModel = require("../models/conversationModel");
const messageModel = require("../models/messageModel");
const prisma = require("../prismaClient");

const toName = (user, fallback) => {
  const first = String(user?.firstName || "").trim();
  const last = String(user?.lastName || "").trim();
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || fallback;
};

const toLegacyConversationShape = (row, currentUserId) => ({
  id: row.id,
  applicationId: row.application_id,
  jobId: row.job_id,
  jobTitle: row.job_title,
  recruiterId: row.recruiter_id,
  jobseekerId: row.jobseeker_id,
  participants: [row.recruiter_id, row.jobseeker_id],
  otherUserId: row.other_user_id,
  otherUserName: row.other_user_name,
  unreadCount: Number(row.unread_count || 0),
  lastMessage: row.last_message || "",
  lastMessageTime: row.last_message_at,
  createdAt: row.created_at,
  currentUserId,
});

const toLegacyMessageShape = (row) => ({
  id: row.id,
  conversationId: row.conversation_id,
  senderId: row.sender_id,
  messageText: row.message_text,
  content: row.message_text,
  text: row.message_text,
  isRead: Boolean(row.is_read),
  createdAt: row.created_at,
  timestamp: row.created_at,
});

const getAllConversations = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
      const rows = await conversationModel.getConversationsForUser({ userId });
      const conversations = rows.map((row) => toLegacyConversationShape(row, userId));
      return res.status(200).json({ success: true, data: conversations });
    } catch (sqlError) {
      const prismaConversations = await prisma.conversation.findMany({
        where: {
          participantIds: {
            has: userId,
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      const participantIds = [...new Set(prismaConversations.flatMap((c) => c.participantIds || []))];
      const users = participantIds.length
        ? await prisma.user.findMany({
            where: { id: { in: participantIds } },
            select: { id: true, firstName: true, lastName: true },
          })
        : [];
      const userMap = new Map(users.map((u) => [u.id, u]));

      const conversations = prismaConversations.map((c) => {
        const participants = Array.isArray(c.participantIds) ? c.participantIds : [];
        const otherUserId = participants.find((id) => id !== userId) || participants[0] || null;
        return {
          id: c.id,
          applicationId: null,
          jobId: null,
          recruiterId: participants[0] || null,
          jobseekerId: participants[1] || null,
          participants,
          otherUserId,
          otherUserName: toName(userMap.get(otherUserId), "User"),
          unreadCount: Number(c.unreadCount || 0),
          lastMessage: c.lastMessage || "",
          lastMessageTime: c.lastMessageTime || c.updatedAt,
          createdAt: c.createdAt,
          currentUserId: userId,
        };
      });

      return res.status(200).json({ success: true, data: conversations });
    }
  } catch (error) {
    console.error("getAllConversations error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch conversations" });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
      const count = await conversationModel.getUnreadCountForUser({ userId });
      return res.status(200).json({ success: true, count: Number(count || 0) });
    } catch (_) {
      const rows = await prisma.conversation.findMany({
        where: { participantIds: { has: userId } },
        select: { unreadCount: true },
      });
      const count = rows.reduce((sum, row) => sum + Number(row.unreadCount || 0), 0);
      return res.status(200).json({ success: true, count });
    }
  } catch (error) {
    console.error("getUnreadCount error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch unread count" });
  }
};

const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
      const row = await conversationModel.getConversationByIdForUser(id, userId);

      if (!row) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const data = {
        id: row.id,
        applicationId: row.application_id,
        jobId: row.job_id,
        jobTitle: row.job_title,
        recruiterId: row.recruiter_id,
        recruiterName: [row.recruiter_first_name, row.recruiter_last_name].filter(Boolean).join(" "),
        jobseekerId: row.jobseeker_id,
        jobseekerName: [row.jobseeker_first_name, row.jobseeker_last_name].filter(Boolean).join(" "),
        participants: [row.recruiter_id, row.jobseeker_id],
        lastMessageTime: row.last_message_at,
        createdAt: row.created_at,
      };

      return res.status(200).json({ success: true, data });
    } catch (_) {
      const convo = await prisma.conversation.findUnique({ where: { id } });
      if (!convo || !convo.participantIds?.includes(userId)) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: convo.id,
          participants: convo.participantIds,
          lastMessageTime: convo.lastMessageTime || convo.updatedAt,
          createdAt: convo.createdAt,
        },
      });
    }
  } catch (error) {
    console.error("getConversationById error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch conversation" });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
      const conversation = await conversationModel.getConversationByIdForUser(id, userId);
      if (!conversation) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const rows = await messageModel.getMessagesByConversationId(id);
      const messages = rows.map(toLegacyMessageShape);
      return res.status(200).json({ success: true, data: messages });
    } catch (_) {
      const convo = await prisma.conversation.findUnique({ where: { id } });
      if (!convo || !convo.participantIds?.includes(userId)) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const rows = await prisma.message.findMany({
        where: { conversationId: id, isDeleted: false },
        orderBy: { createdAt: "asc" },
      });
      const messages = rows.map((row) => ({
        id: row.id,
        conversationId: row.conversationId,
        senderId: row.senderId,
        messageText: row.content,
        content: row.content,
        text: row.content,
        isRead: Boolean(row.isRead),
        createdAt: row.createdAt,
        timestamp: row.timestamp || row.createdAt,
      }));
      return res.status(200).json({ success: true, data: messages });
    }
  } catch (error) {
    console.error("getConversationMessages error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
};

const sendConversationMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const messageText = (req.body?.messageText || req.body?.content || req.body?.text || "").trim();

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!messageText) {
      return res.status(400).json({ success: false, error: "messageText is required" });
    }

    let shaped;
    try {
      const conversation = await conversationModel.getConversationByIdForUser(id, userId);
      if (!conversation) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const saved = await messageModel.createMessage({
        conversationId: id,
        senderId: userId,
        messageText,
      });

      shaped = toLegacyMessageShape(saved);
    } catch (_) {
      const convo = await prisma.conversation.findUnique({ where: { id } });
      if (!convo || !convo.participantIds?.includes(userId)) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const receiverId = convo.participantIds.find((pid) => pid !== userId) || null;
      const saved = await prisma.message.create({
        data: {
          conversationId: id,
          senderId: userId,
          receiverId,
          content: messageText,
          timestamp: new Date().toISOString(),
        },
      });

      await prisma.conversation.update({
        where: { id },
        data: {
          lastMessage: messageText,
          lastMessageTime: new Date().toISOString(),
          unreadCount: { increment: 1 },
        },
      });

      shaped = {
        id: saved.id,
        conversationId: saved.conversationId,
        senderId: saved.senderId,
        messageText: saved.content,
        content: saved.content,
        text: saved.content,
        isRead: Boolean(saved.isRead),
        createdAt: saved.createdAt,
        timestamp: saved.timestamp || saved.createdAt,
      };
    }

    try {
      const io = getIo();
      io.to(id).emit("receive_message", shaped);
    } catch (_) {
      // Keep REST flow successful even if socket broadcast fails.
    }

    return res.status(201).json({ success: true, data: shaped });
  } catch (error) {
    console.error("sendConversationMessage error:", error);
    return res.status(500).json({ success: false, error: "Failed to send message" });
  }
};

const markConversationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    try {
      const conversation = await conversationModel.getConversationByIdForUser(id, userId);
      if (!conversation) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const updatedCount = await messageModel.markConversationRead({
        conversationId: id,
        currentUserId: userId,
      });

      return res.status(200).json({ success: true, updatedCount });
    } catch (_) {
      const convo = await prisma.conversation.findUnique({ where: { id } });
      if (!convo || !convo.participantIds?.includes(userId)) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      const result = await prisma.message.updateMany({
        where: {
          conversationId: id,
          senderId: { not: userId },
          isRead: false,
        },
        data: { isRead: true },
      });

      await prisma.conversation.update({
        where: { id },
        data: { unreadCount: 0 },
      });

      return res.status(200).json({ success: true, updatedCount: result.count || 0 });
    }
  } catch (error) {
    console.error("markConversationRead error:", error);
    return res.status(500).json({ success: false, error: "Failed to mark messages as read" });
  }
};

const getTypingUsers = (_req, res) => {
  res.status(200).json({ success: true, data: [] });
};

const updateTypingStatus = (_req, res) => {
  res.status(200).json({ success: true, data: [] });
};

module.exports = {
  getAllConversations,
  getUnreadCount,
  getConversationById,
  getConversationMessages,
  sendConversationMessage,
  markConversationRead,
  getTypingUsers,
  updateTypingStatus,
};
