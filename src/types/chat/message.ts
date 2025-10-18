import { MessageDTO } from "../DTO";

export type Align = 'left' | 'right';


export type ChatMessage = {
    id: string | number;
    speaker: string;
    timestamp: string; // e.g. "Now" or "6"
    content: string; // can contain \n
    align: Align;
};

export type MessageByIdResponse = {
  _id?: string;
  chat?: { _id?: string } | string;
  data?: { _id?: string; chat?: { _id?: string } | string };
} & Partial<MessageDTO>;

export type MessageLike = Omit<MessageDTO, "chat"> & {
  chat?: { _id?: string } | string;
};

export type IncomingMessagePayload = MessageLike | { latestMessage?: MessageLike };