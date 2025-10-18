import { MessageDTO } from "./MessageDto";
import { UserId } from "./UserDto";

export type ChatId = string;
export interface ChatDTO {
  _id: ChatId;
  chatName?: string;
  isGroupChat: boolean;
  isBotChat?: boolean;
  bot?: {
    _id: string;
    name: string;
  };
  users: UserId[];
  latestMessage: MessageDTO;
}