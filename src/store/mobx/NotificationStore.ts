import { makeAutoObservable, runInAction } from "mobx";
import NotificationService from "../../services/notifications/NotificationService";
import { LastMessages } from "../../types/notification/notificarion-api";
import { BaseStore, StoreListener } from "./BaseStore";
import { RootStore } from "../rootStore";
import { NotificationDTOExtend } from "../../types";

export class NotificationStore {
  private readonly baseStore = new BaseStore();
  readonly subscribe: (listener: StoreListener) => () => void;
  private root: RootStore;
  /** Полный список уведомлений */
  notifications: NotificationDTOExtend[] = [];
  /** Последние уведомления (например, для краткого просмотра) */
  lastNotifications: NotificationDTOExtend[] = [];
  /** Общее количество последних уведомлений */
  notificationsCount = 0;
  
  /** Список последних сообщений уведомлений */
  lastMessages: LastMessages[] = [];
  /** Количество последних сообщений */
  messagesCount = 0;

  constructor(root: RootStore) {
    this.root = root;
    this.subscribe = this.baseStore.subscribe;
    makeAutoObservable(this, {
      baseStore: false,
      subscribe: false,
      notify: false,
      root: false,
    } as any);
  }

  private notify() {
    this.baseStore.notify();
  }

  get snapshotVersion() {
    return this.baseStore.snapshotVersion;
  }

  /**
   * Геттер для получения полного списка уведомлений.
   */
  get allNotifications() {
    return this.notifications;
  }

  /**
   * Очищает список уведомлений.
   */
  clearNotifications() {
    this.notifications = [];
  }

  /**
   * Удаляет уведомление из списка по его идентификатору.
   * @param id Идентификатор уведомления
   */
  removeNotification(id: string) {
    this.notifications = this.notifications.filter(
      (notification) => notification._id !== id
    );
  }

  /**
   * Загружает полный список уведомлений.
   */
  async fetchNotifications() {
    try {
      const notifications = await NotificationService.fetchNotifications();
      runInAction(() => {
        this.notifications = notifications;
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  /**
   * Загружает последние уведомления.
   */
  async fetchLastNotifications() {
    try {
      const { lastNotifications, count } = await NotificationService.fetchLastNotifications();
      runInAction(() => {
        this.lastNotifications = lastNotifications;
        this.notificationsCount = count;
      });
    } catch (error) {
      console.error("Error fetching last notifications:", error);
    }
  }

  /**
   * Загружает последние сообщения уведомлений.
   */
  async fetchLastMessages() {
    try {
      const { lastNotifications, count } = await NotificationService.fetchLastMessages();
      runInAction(() => {
        this.lastMessages = lastNotifications;
        this.messagesCount = count;
      });
    } catch (error) {
      console.error("Error fetching last messages:", error);
    }
  }

  /**
   * Помечает уведомление как открытое по его идентификатору.
   * @param id Идентификатор уведомления
   */
  async markNotificationAsOpened(id: string) {
    try {
      await NotificationService.markAsOpened(id);
    } catch (error) {
      console.error("Error marking notification as opened:", error);
    }
  }

  /**
   * Помечает все уведомления как открытые.
   */
  async markAllNotificationsAsOpened() {
    try {
      await NotificationService.markAllAsOpened();
    } catch (error) {
      console.error("Error marking all notifications as opened:", error);
    }
  }

  /**
   * Удаляет уведомление по его идентификатору и обновляет список.
   * @param id Идентификатор уведомления
   */
  async deleteNotificationById(id: string) {
    try {
      await NotificationService.deleteNotification(id);
      runInAction(() => {
        this.removeNotification(id);
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }
}
