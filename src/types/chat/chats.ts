import { ChatDTO, MessageDTO } from "../DTO";

type AuthRouteKey = string;

export type ChatThread = {
  id: number;
  name: string;
  preview: string;
  timestamp: string;
  routeKey: AuthRouteKey;
  avatar?: {
    src: string;
    alt?: string;
  };
};

export interface FetchChatsResponse {
  chats: ChatDTO[];
  hasMore: boolean;
}

export type UnreadStatus = {
  hasUnread: boolean;
  group: boolean;
  private: boolean;
  bot: boolean;
};

export interface FetchChatsOptions {
  typeChat?: 'private' | 'group' | 'bot';
  limit?: number;
  page?: number;
  search?: string;
}

export type FormDataImage = {
  uri: string;
  name: string;
  type: string;
};


export type UploadImage = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

export type ChatListItem = ChatDTO & {
  unread?: number | null | boolean;
  post?: { title?: string | null } | null;
  latestMessage?: MessageDTO | null;
};

