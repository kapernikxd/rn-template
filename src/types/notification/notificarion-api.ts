import { MessageDTO, NotificationDTOExtend, UserDTO } from "../DTO";

export type NotificationResponse = {
  count: number;
  lastNotifications: NotificationDTOExtend[];
};

export type LastMessages = {
  _id: string;
  count: number;
  entityId: string;
  userFrom: UserDTO;
  message: MessageDTO;
};

export type LastMessagesResponse = {
  count: number;
  lastNotifications: LastMessages[];
};
