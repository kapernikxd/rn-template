import { ChatById } from "../../../types/chat";

export function getCompanionUser(chat: ChatById, myId?: string) {
  return chat?.users?.find(user => user._id !== myId);
}

export function compareByLatestMessageDesc(a: any, b: any) {
  const at = new Date(a?.latestMessage?.createdAt ?? 0).getTime();
  const bt = new Date(b?.latestMessage?.createdAt ?? 0).getTime();
  // при равенстве времени — стабилизируем по _id, чтобы порядок был детерминированным
  if (bt === at) return (b._id ?? '').localeCompare(a._id ?? '');
  return bt - at;
}