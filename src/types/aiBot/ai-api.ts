import { AiBotDetails } from "../DTO/AiBotDto";


export interface AiBotUpdatePayload {
  name?: string;
  lastname?: string;
  profession?: string;
  userBio?: string;
  aiPrompt?: string;
  intro?: string;
  introMessage?: string;
  categories?: string[];
  usefulness?: string[];
}

export interface AiBotReportPayload {
  reason?: string;
  details?: string;
  targetId: string;
}

export interface AiBotPhotoResponse extends AiBotDetails {
  id?: string;
  botId: string;
  photos: string[];
  createdAt?: string;
  updatedAt?: string;
  isFollowing: boolean;
}

export interface GuestChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GuestAiBotMessagePayload {
  message: string;
  sessionId?: string;
  history?: GuestChatMessage[];
}

export interface GuestAiBotMessageResponse {
  reply: string;
  limit?: number;
  remainingRequests?: number;
  sessionId?: string;
}