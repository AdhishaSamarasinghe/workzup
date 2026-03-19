export type ChatRole = "user" | "assistant";

export interface ChatHistoryMessage {
  role: ChatRole;
  content: string;
}

export interface ChatPreferences {
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  workMode?: string;
  availability?: string[];
  salaryMin?: number;
  salaryMax?: number;
  categories?: string[];
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ChatUserProfile {
  id?: string;
  name?: string;
  email?: string;
  title?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: unknown[];
  languages?: string[];
  availableTimes?: string;
  preferences?: ChatPreferences | null;
  [key: string]: unknown;
}

export interface ChatRequestBody {
  message: string;
  userProfile?: ChatUserProfile | null;
  messages?: ChatHistoryMessage[];
}

export interface ChatResponseBody {
  role: "assistant";
  content: string;
}
