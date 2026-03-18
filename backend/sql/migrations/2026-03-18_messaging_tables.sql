-- Messaging schema for application-scoped conversations
-- Run this file against PostgreSQL before using the new messaging APIs.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES "Application"(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  jobseeker_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conversations_participants_different CHECK (recruiter_id <> jobseeker_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_recruiter_id ON conversations(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_conversations_jobseeker_id ON conversations(jobseeker_id);
CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON conversations(job_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT messages_non_empty_text CHECK (length(trim(message_text)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_unread_lookup ON messages(conversation_id, is_read, sender_id);
