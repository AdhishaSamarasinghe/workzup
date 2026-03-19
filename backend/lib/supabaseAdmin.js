const { Prisma } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const prisma = require("../prismaClient");
const db = require("../models/db");

let supabaseAdmin = null;

function getSupabaseAdmin() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

function normalizeRole(role) {
  const key = String(role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (key === "JOBSEEKER" || key === "JOB_SEEKER") return "JOB_SEEKER";
  if (key === "RECRUITER") return "RECRUITER";
  if (key === "EMPLOYER") return "EMPLOYER";
  if (key === "ADMIN") return "ADMIN";

  return key;
}

function buildSupabaseMetadata(data) {
  const role = normalizeRole(data.role);
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();

  return {
    first_name: data.firstName || "",
    last_name: data.lastName || "",
    full_name: fullName || data.companyName || "",
    name: fullName || data.companyName || "",
    company_name: data.companyName || "",
    phone: data.phone || "",
    role,
  };
}

async function createSupabaseUser({
  email,
  password,
  metadata,
  role,
  preferredId,
  emailConfirmed = true,
}) {
  const admin = getSupabaseAdmin();

  const basePayload = {
    email,
    password,
    email_confirm: emailConfirmed,
    user_metadata: metadata,
    app_metadata: { role: normalizeRole(role) },
  };

  if (preferredId) {
    const preferredAttempt = await admin.auth.admin.createUser({
      ...basePayload,
      id: preferredId,
    });

    if (!preferredAttempt.error) {
      return preferredAttempt.data.user;
    }
  }

  const { data, error } = await admin.auth.admin.createUser(basePayload);
  if (error) {
    throw error;
  }

  return data.user;
}

async function getSupabaseUserById(userId) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error) {
    return null;
  }

  return data.user || null;
}

async function getSupabaseUserByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const admin = getSupabaseAdmin();
  const pageSize = 200;
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: pageSize,
    });

    if (error) {
      throw error;
    }

    const users = data?.users || [];
    const matchedUser = users.find(
      (user) => String(user.email || "").trim().toLowerCase() === normalizedEmail,
    );

    if (matchedUser) {
      return matchedUser;
    }

    if (users.length < pageSize) {
      return null;
    }

    page += 1;
  }
}

async function resolveSupabaseAuthUserIdForAppUser(user) {
  if (!user?.id) {
    return null;
  }

  const byId = await getSupabaseUserById(user.id);
  if (byId?.id) {
    return byId.id;
  }

  if (!user.email) {
    return null;
  }

  const byEmail = await getSupabaseUserByEmail(user.email);
  return byEmail?.id || null;
}

async function getOrCreateDirectConversation(userA, userB) {
  if (!userA || !userB) {
    throw new Error("Both conversation participants are required.");
  }

  if (userA === userB) {
    throw new Error("Conversation participants must be different.");
  }

  const normalizedUser1 = userA < userB ? userA : userB;
  const normalizedUser2 = userA < userB ? userB : userA;

  const existing = await db.query(
    `
      select *
      from public.conversations
      where user1_id = $1
        and user2_id = $2
      limit 1
    `,
    [normalizedUser1, normalizedUser2],
  );

  if (existing.rows[0]?.id) {
    return existing.rows[0];
  }

  const inserted = await db.query(
    `
      insert into public.conversations (user1_id, user2_id)
      values ($1, $2)
      on conflict ((least(user1_id, user2_id)), (greatest(user1_id, user2_id))) do nothing
      returning *
    `,
    [normalizedUser1, normalizedUser2],
  );

  if (inserted.rows[0]?.id) {
    return inserted.rows[0];
  }

  const conflicted = await db.query(
    `
      select *
      from public.conversations
      where user1_id = $1
        and user2_id = $2
      limit 1
    `,
    [normalizedUser1, normalizedUser2],
  );

  if (!conflicted.rows[0]?.id) {
    throw new Error("Failed to create or load direct conversation.");
  }

  return conflicted.rows[0];
}

async function updateSupabaseUser(userId, { email, password, metadata, role }) {
  const admin = getSupabaseAdmin();
  const payload = {
    user_metadata: metadata,
    app_metadata: { role: normalizeRole(role) },
  };

  if (email) payload.email = email;
  if (password) payload.password = password;

  const { data, error } = await admin.auth.admin.updateUserById(userId, payload);
  if (error) {
    throw error;
  }

  return data.user;
}

async function migratePrismaUserId(oldUserId, newUserId) {
  if (!oldUserId || !newUserId || oldUserId === newUserId) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { id: oldUserId },
    });

    if (!existingUser) {
      throw new Error("Legacy user not found for migration.");
    }

    const archivedEmail = `migrated+${oldUserId}@workzup.local`;

    await tx.user.update({
      where: { id: oldUserId },
      data: { email: archivedEmail },
    });

    await tx.user.create({
      data: {
        id: newUserId,
        email: existingUser.email,
        passwordHash: existingUser.passwordHash,
        role: existingUser.role,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        gender: existingUser.gender,
        homeTown: existingUser.homeTown,
        phone: existingUser.phone,
        cv: existingUser.cv,
        idDocument: existingUser.idDocument,
        idFront: existingUser.idFront,
        idBack: existingUser.idBack,
        onboardingStep: existingUser.onboardingStep,
        isProfileComplete: existingUser.isProfileComplete,
        termsAccepted: existingUser.termsAccepted,
        emailNotifications: existingUser.emailNotifications,
        isVerified: existingUser.isVerified,
        isBanned: existingUser.isBanned,
        createdAt: existingUser.createdAt,
      },
    });

    await tx.seekerProfile.updateMany({
      where: { userId: oldUserId },
      data: { userId: newUserId },
    });

    await tx.company.updateMany({
      where: { recruiterId: oldUserId },
      data: { recruiterId: newUserId },
    });

    await tx.job.updateMany({
      where: { employerId: oldUserId },
      data: { employerId: newUserId },
    });

    await tx.application.updateMany({
      where: { applicantId: oldUserId },
      data: { applicantId: newUserId },
    });

    await tx.savedJob.updateMany({
      where: { userId: oldUserId },
      data: { userId: newUserId },
    });

    await tx.payment.updateMany({
      where: { workerId: oldUserId },
      data: { workerId: newUserId },
    });

    await tx.review.updateMany({
      where: { reviewerId: oldUserId },
      data: { reviewerId: newUserId },
    });

    await tx.review.updateMany({
      where: { revieweeId: oldUserId },
      data: { revieweeId: newUserId },
    });

    await tx.notification.updateMany({
      where: { userId: oldUserId },
      data: { userId: newUserId },
    });

    await tx.message.updateMany({
      where: { senderId: oldUserId },
      data: { senderId: newUserId },
    });

    await tx.message.updateMany({
      where: { receiverId: oldUserId },
      data: { receiverId: newUserId },
    });

    await tx.$executeRaw(
      Prisma.sql`UPDATE "Conversation"
        SET "participantIds" = array_replace("participantIds", ${oldUserId}, ${newUserId})
        WHERE ${oldUserId} = ANY("participantIds")`,
    );

    await tx.user.delete({
      where: { id: oldUserId },
    });
  });
}

async function ensureSupabaseUserForLegacyUser(user, password) {
  const metadata = buildSupabaseMetadata({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
  });

  const existingSupabaseUser = await getSupabaseUserById(user.id);

  if (existingSupabaseUser) {
    await updateSupabaseUser(user.id, {
      email: user.email,
      password,
      metadata,
      role: user.role,
    });

    return existingSupabaseUser;
  }

  const createdSupabaseUser = await createSupabaseUser({
    email: user.email,
    password,
    metadata,
    role: user.role,
    preferredId: user.id,
    emailConfirmed: true,
  });

  if (createdSupabaseUser.id !== user.id) {
    await migratePrismaUserId(user.id, createdSupabaseUser.id);
  }

  return createdSupabaseUser;
}

module.exports = {
  buildSupabaseMetadata,
  createSupabaseUser,
  ensureSupabaseUserForLegacyUser,
  getSupabaseAdmin,
  getOrCreateDirectConversation,
  getSupabaseUserByEmail,
  getSupabaseUserById,
  migratePrismaUserId,
  normalizeRole,
  resolveSupabaseAuthUserIdForAppUser,
  updateSupabaseUser,
};
