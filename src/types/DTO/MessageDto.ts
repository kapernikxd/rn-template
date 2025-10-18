import { ChatId } from "./ChatDto";
import { UserDTO, UserId } from "./UserDto";

export type MessageId = string;

type Sender = {
  _id: UserId;
}
export interface MessageDTO {
  _id: MessageId;
  sender: Sender;
  content: string;
  chat?: {
    _id?: string
  } | string;
  readBy: UserId[];
  createdAt: string;
  replyTo?: MessageDTO;
  isEdited: boolean;
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
  isEdited: boolean;
  images?: string[];
  attachments?: string[];
}
