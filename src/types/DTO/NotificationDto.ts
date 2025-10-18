import { MessageId } from "./MessageDto";
import { UserDTO, UserId } from "./UserDto";

export type TNotification =
  | "postLike"
  | "follow"
  | "newPost"
  | "updatePost"
  | "newMessage"
  | "newParticipate"
  | "confirmParticipate"
  | "rejectParticipate"
  | "requestParticipate"
  | "invite"
  | "postLike"
  | "pollInvite"
  | "pollAnswer";

export type NotificationId = string;

export interface NotificationDTO {
  _id: NotificationId;
  opened: boolean;
  userTo: UserId;
  userFrom: UserId;
  notificationType: TNotification;
  entityId: MessageId | UserId;
  createdAt: string;
}

export type NotificationDTOExtend = Omit<NotificationDTO, "userFrom"> & {
  userFrom: UserDTO;
};
