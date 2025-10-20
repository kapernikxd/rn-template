import moment from "moment";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs from "dayjs";

dayjs.extend(customParseFormat);

export const getTimeAgo = (time: string) =>
  time ? moment(time).fromNow() : null;

export const getDateShow = (date: string) =>
  date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : null; //2025-05-31 17:00:00

export const getStartDate = (date?: string | Date) =>
  date ? moment(date).format("D MMMM, HH:mm") : null; //4 May, 17:00

export const getDateTime = (date: string) =>
  date ? moment(date).format("D MMM, HH:mm") : null;

export const formatLastSeen = (lastSeen: string | null): string => {
  if (moment().diff(moment(lastSeen), 'hours') > 12) {
    return moment(lastSeen).format('D MMM YYYY, HH:mm'); // старая активность
  } else {
    return moment(lastSeen).fromNow(); // недавно
  }
}

/**
 * Если прошло больше часа → показываем время в формате HH:mm
 * Если прошло меньше часа → показываем "минуты назад" через fromNow()
 */
export const getSmartTime = (time: string) => {
  if (!time) return undefined;

  const now = moment();
  const messageTime = moment(time);

  // Проверяем, относится ли время к «вчера»
  // if (messageTime.isSame(now.clone().subtract(1, 'day'), 'day')) {
  //   return messageTime.format('D MMM, HH:mm');
  // }

  if (messageTime.isSame(now, 'day')) {
    const diffInMinutes = now.diff(messageTime, 'minutes');
    // Если отправлено/создано <= 5 минут назад — показываем "несколько секунд назад" и т.д.
    if (diffInMinutes <= 5) {
      return messageTime.fromNow(); // "2 минуты назад"
    }
    // Иначе показываем только время: "14:25"
    return messageTime.format('HH:mm');
  }

  return messageTime.format('D MMM, HH:mm');
};


interface IMessage {
  _id: string;
  createdAt: string;
  // ...остальное
}

type MessageOrDate = IMessage | { _id: string; dateLabel: string };

function getDateLabel(createdAt: string): string {
  const dateMoment = moment(createdAt);
  if (dateMoment.isSame(moment(), 'day')) {
    return 'Today';
  }
  if (dateMoment.isSame(moment().subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  }
  return dateMoment.format('DD MMM YYYY');
}

function mergeBySenderAndTime(
  messages: IMessage[],
  thresholdMinutes: number
): IMessage[] {
  const merged: IMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const currentMsg: any = messages[i];

    if (!merged.length) {
      merged.push({ ...currentMsg });
      continue;
    }

    const lastMergedIndex = merged.length - 1;
    const lastMerged: any = merged[lastMergedIndex];

    const sameSender = lastMerged?.sender?._id === currentMsg?.sender?._id;
    const diffMin = moment(lastMerged.createdAt).diff(moment(currentMsg.createdAt), 'minutes');

    if (sameSender && diffMin >= 0 && diffMin <= thresholdMinutes) {
      merged[lastMergedIndex] = {
        ...lastMerged,
        createdAt: currentMsg.createdAt, // Обновляем время на самое раннее
        content: currentMsg.content + '\n' + lastMerged.content, // ✅ Меняем порядок
      };
    } else {
      merged.push({ ...currentMsg });
    }
  }
  return merged;
}

export function generateMessagesWithDates(
  messages: IMessage[]
): MessageOrDate[] {
  // 1) Сортируем от новых к старым
  const sorted = [...messages].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );

  const result: MessageOrDate[] = [];
  let currentDateLabel = '';
  let tempGroup: IMessage[] = [];

  const pushGroupWithDate = (dateLabel: string) => {
    if (tempGroup.length === 0) return;

    // Сливаем сообщения в tempGroup, если идут подряд и разница <= 2 минут
    // const mergedGroup = mergeBySenderAndTime(tempGroup, 1);
    const mergedGroup = tempGroup;

    // Добавляем «слитые» сообщения в итог
    result.push(...mergedGroup);

    // Потом вставляем dateLabel
    result.push({
      _id: 'date-' + dateLabel,
      dateLabel: dateLabel,
    });

    // Очищаем «буфер»
    tempGroup = [];
  };

  for (let i = 0; i < sorted.length; i++) {
    const msg = sorted[i];
    // Допустим, у вас есть некая функция getDateLabel, возвращающая "Today", "Yesterday", "14 мар", и т.д.
    const label = getDateLabel(msg.createdAt);

    // Если новая дата — нужно «закрыть» предыдущую
    if (label !== currentDateLabel && tempGroup.length > 0) {
      pushGroupWithDate(currentDateLabel);
    }

    if (label !== currentDateLabel) {
      currentDateLabel = label;
    }
    // Накапливаем сообщение в буфер
    tempGroup.push(msg);
  }

  // Не забудем «закрыть» последнюю группу, если она осталась
  if (tempGroup.length > 0) {
    pushGroupWithDate(currentDateLabel);
  }

  return result;
}