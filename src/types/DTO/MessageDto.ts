import { ChatId } from "./ChatDto";
import { UserDTO, UserId } from "./UserDto";

export type MessageId = string;

type Sender = {
  _id: UserId;
}
export type MessageStatus = 'active' | 'deleted';

export interface MessageDTO {
  _id: MessageId;
  sender: Sender;
  content: string;
  chat?: {
    _id?: string
  } | string;
  readBy: UserId[];
  createdAt: string;
  updatedAt?: string;
  replyTo?: MessageDTO;
  isEdited: boolean;
  status?: MessageStatus;
  pinned?: boolean;
  images?: string[];
  attachments?: string[];
}

export interface MessageDTOExtented {
  _id: MessageId;
  sender: UserDTO;
  content: string;
  chat: ChatId;
  readBy: UserId[];
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
  status?: MessageStatus;
  pinned?: boolean;
  images?: string[];
  attachments?: string[];
}
