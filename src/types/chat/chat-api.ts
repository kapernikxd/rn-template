import { UserDTO } from "../DTO";


export interface ChatById {
  _id: string;
  isGroupChat: boolean;
  latestMessage?: string; // ID последнего сообщения
  users: UserDTO[]; // Список пользователей в чате
  chatName?: string;
  postId?: string; // ID связанного поста
  post?: any; //
}

export type ReadedMessageResponse = {
  senderId: string;
  chatId: string;
  lastReadedMessageId: string;
};
