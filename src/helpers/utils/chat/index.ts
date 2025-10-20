import { ChatById } from "../../../types/chat";

export function getCompanionUser(chat: ChatById, myId?: string) {
  return chat.users.find(user => user._id !== myId);
}