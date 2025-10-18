import { $api } from "../../helpers";

export enum PushNotificationGroupType {
  GROUP = "group",
  PRIVATE = "private",
}

export type PushNotificationFromChatType = {
  fromName: string;
  message: string;
  userIds: string[];
  chatId: string;
  type: PushNotificationGroupType;
};

export async function sendGroupNotificationRequest(
  payload: PushNotificationFromChatType
): Promise<void> {
  await $api.post("/push/group", payload);
}
