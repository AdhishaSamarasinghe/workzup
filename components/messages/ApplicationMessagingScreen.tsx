"use client";

import type { MessagingAudience } from "@/lib/messaging/types";
import ChatLayout from "./ChatLayout";

type Props = {
  audience: MessagingAudience;
};

export default function ApplicationMessagingScreen({ audience }: Props) {
  return <ChatLayout audience={audience} />;
}
