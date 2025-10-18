import { AxiosResponse } from "axios";
import { $api } from "../../helpers";
import { LastMessagesResponse, NotificationResponse } from "../../types/notification";
import { NotificationDTOExtend } from "../../types";

/**
 * Сервис для работы с API уведомлений.
 */
export class NotificationService {
  /**
   * Получить список всех уведомлений.
   * @returns Массив уведомлений.
   */
  public async fetchNotifications(): Promise<NotificationDTOExtend[]> {
    return $api
      .get<NotificationDTOExtend[]>("/notifications")
      .then((res) => res.data);
  }

  /**
   * Получить последние уведомления.
   * @returns Объект с массивом последних уведомлений и количеством.
   */
  public async fetchLastNotifications(): Promise<NotificationResponse> {
    return $api
      .get<NotificationResponse>("/notifications/latest")
      .then((res) => res.data);
  }

  /**
   * Получить последние сообщения уведомлений.
   * @returns Объект с массивом последних сообщений и их количеством.
   */
  public async fetchLastMessages(): Promise<LastMessagesResponse> {
    return $api
      .get<LastMessagesResponse>("/notifications/latest/messages")
      .then((res) => res.data);
  }

  /**
   * Пометить уведомление как открытое по его идентификатору.
   * @param id Идентификатор уведомления.
   */
  public async markAsOpened(id: string): Promise<AxiosResponse> {
    return $api.put(`/notifications/${id}/markAsOpened`);
  }

  /**
   * Пометить все уведомления как открытые.
   */
  public async markAllAsOpened(): Promise<AxiosResponse> {
    return $api.put(`/notifications/markAsOpened`);
  }

  /**
   * Удалить уведомление по его идентификатору.
   * @param id Идентификатор уведомления.
   */
  public async deleteNotification(id: string): Promise<AxiosResponse> {
    return $api({
      method: "DELETE",
      url: `/notifications/${id}`,
    });
  }
}

export default new NotificationService();
