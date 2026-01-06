import { makeAutoObservable, runInAction } from "mobx";
import i18n from "i18next";
import ChatService from "../../services/chat/ChatService";
import * as ImagePicker from 'expo-image-picker';
import { RootStore } from "../rootStore";
import { ChatDTO, MessageDTO } from "../../types";
import type { NatalChartPayload } from "../../types/astrology";
import { ChatById, FetchChatsOptions, ReadedMessageResponse } from "../../types/chat";
import { BaseStore, StoreListener } from "./BaseStore";
import { isEmpty } from "../../helpers/utils/common";


export class ChatStore {
  private readonly baseStore = new BaseStore();
  readonly subscribe: (listener: StoreListener) => () => void;
  private root: RootStore;

  chats: ChatDTO[] = [];
  selectedChat: ChatById | null = null;
  messages: MessageDTO[] = [];
  pinnedMessages: MessageDTO[] = [];

  lastReadedMessage: ReadedMessageResponse = {} as ReadedMessageResponse;
  opponentId: string | undefined = undefined;

  hasMoreMessages = true;
  hasMoreChats = true;
  isLoadingChats = false;

  private chatsRequestId = 0;

  isApiCheckedNewMessages = false;

  private currentChatSubscribedId: string | null = null;

  private chatService: ChatService;
  private startedInitialChatsFor = new Set<string>();

  constructor(root: RootStore) {
    this.root = root;
    this.subscribe = this.baseStore.subscribe;
    makeAutoObservable(this, {
      baseStore: false,
      subscribe: false,
      notify: false,
      root: false,
      startedInitialChatsFor: false,
    } as any);
    this.chatService = new ChatService();
  }

  private notify() {
    this.baseStore.notify();
  }

  private applyMessageDeletion(messageId: string, patch?: Partial<MessageDTO>) {
    const sanitizedPatch: Partial<MessageDTO> = {
      ...(patch ?? {}),
      status: patch?.status ?? 'deleted',
      content: patch?.content ?? 'deleted',
      attachments: [],
      images: [],
    };

    const applyToMessage = (message: MessageDTO): MessageDTO => {
      if (message._id === messageId) {
        return {
          ...message,
          ...sanitizedPatch,
        };
      }

      if (message.replyTo?._id === messageId) {
        return {
          ...message,
          replyTo: {
            ...message.replyTo,
            ...sanitizedPatch,
          },
        };
      }

      return message;
    };

    this.messages = this.messages.map(applyToMessage);
    this.pinnedMessages = this.pinnedMessages.map(applyToMessage);
  }

  get snapshotVersion() {
    return this.baseStore.snapshotVersion;
  }

  async loadPinnedMessages(chatId: string) {
    try {
      const { data } = await this.chatService.fetchPinnedMessages(chatId);
      runInAction(() => {
        this.pinnedMessages = data.data || [];
      });
    } catch (e) {
      console.error("Error loading pinned messages:", e);
    }
  }

  isMessagePinned(id: string) {
    return this.pinnedMessages?.some((m) => m._id === id);
  }

  async pinMessage(message: MessageDTO) {
    if (this.isMessagePinned(message._id)) return;
    // if (this.pinnedMessages.length >= 5) {
    //   this.root.uiStore.showSnackbar(
    //     'Можно закрепить до 5 сообщений. Чтобы закрепить новое, сначала открепите одно из текущих.',
    //     'info'
    //   );
    //   return;
    // }

    try {
      await this.chatService.pinMessage(message._id);
      runInAction(() => {
        this.pinnedMessages.push(message);
      });
    } catch (e) {
      console.error("Error pinning message:", e);
    }
  }

  async unpinMessage(messageId: string) {
    try {
      await this.chatService.unpinMessage(messageId);
      runInAction(() => {
        this.pinnedMessages = this.pinnedMessages.filter((m) => m._id !== messageId);
      });
    } catch (e) {
      console.error("Error unpinning message:", e);
    }
  }

  updatePinnedFromMessages() {
    runInAction(() => {
      this.pinnedMessages = this.pinnedMessages
        .filter((pm) => this.messages.find((m) => m._id === pm._id))
        .map((pm) => this.messages.find((m) => m._id === pm._id) || pm);
    });
  }

  cleanMessages() {
    this.messages = [];
  }

  cleanOpponentId() {
    this.opponentId = undefined;
  }

  get isGroupChat() {
    return this.selectedChat?.isGroupChat || false
  }

  get privateChats() {
    return this.chats.filter((chat: any) => !chat.isGroupChat && !chat.isBotChat);
  }

  get groupChats() {
    return this.chats.filter((chat: any) => chat.isGroupChat && chat?.post?.title);
  }

  get botChats() {
    return this.chats.filter((chat: any) => chat.isBotChat);
  }

  // 📌 Обновление чатов
  async refreshChats(options?: FetchChatsOptions) {
    const chatIds = await this.fetchChats({ ...options, page: 1 });
    return chatIds
  }

  async fetchChats(options?: FetchChatsOptions): Promise<string[]> {
    // не дергаем сеть, если уже грузим; и не грузим page>1, если дальше страниц нет
    if (this.isLoadingChats || (options?.page && options.page > 1 && !this.hasMoreChats)) {
      return [];
    }

    const requestId = ++this.chatsRequestId; // защитимся от устаревших ответов
    this.isLoadingChats = true;

    try {
      const response = await this.chatService.fetchChats(options);

      // если за время ожидания пришел новый запрос — игнорим этот ответ
      if (requestId !== this.chatsRequestId) {
        return [];
      }

      runInAction(() => {
        const incomingChats: ChatDTO[] = response?.data?.chats ?? [];

        if (options?.page && options.page > 1) {
          // ---- МЕРЖ СТРАНИЦЫ (>1), СОХРАНЯЕМ ТЕКУЩИЙ ПОРЯДОК ----

          // 1) карта существующих чатов
          const existingById = new Map(this.chats.map((c) => [c._id, c]));

          // 2) обновляем/дополняем данными из пришедшей страницы
          for (const chat of incomingChats) {
            const prev = existingById.get(chat._id);
            existingById.set(chat._id, prev ? { ...prev, ...chat } : chat);
          }

          // 3) сохраняем порядок уже известных + добавляем новые в хвост
          const knownIds = new Set(this.chats.map((c) => c._id));
          const updatedKnown = this.chats.map((c) => existingById.get(c._id)!);
          const appendedNew = incomingChats.filter((c) => !knownIds.has(c._id));

          this.chats = [...updatedKnown, ...appendedNew];
        } else {
          // ---- СТРАНИЦА 1: ПОЛНАЯ ПЕРЕЗАГРУЗКА ----
          // Удаляем дубликаты, оставляя первое вхождение (порядок приходит с бэка)
          const seen = new Set<string>();
          this.chats = (incomingChats ?? []).filter((c) => {
            if (seen.has(c._id)) return false;
            seen.add(c._id);
            return true;
          });

          // Если нужно — можно ОДИН РАЗ отсортировать по свежести:
          // this.chats.sort(
          //   (a, b) =>
          //     new Date(b.latestMessage?.createdAt || 0).getTime() -
          //     new Date(a.latestMessage?.createdAt || 0).getTime()
          // );
        }

        // флажок «есть ли еще страницы»
        this.hasMoreChats = Boolean(response?.data?.hasMore);
      });

      return (response?.data?.chats ?? []).map((chat: ChatDTO) => chat._id);
    } catch (err) {
      console.error("Error fetching chats:", err);
      return [];
    } finally {
      // снимаем флаг только если это актуальный запрос
      if (requestId === this.chatsRequestId) {
        runInAction(() => {
          this.isLoadingChats = false;
        });
      }
    }
  }

  resetChatsPagination({ clearChats = false }: { clearChats?: boolean } = {}) {
    runInAction(() => {
      this.chatsRequestId += 1;
      this.hasMoreChats = true;
      this.isLoadingChats = false;
      if (clearChats) {
        this.chats = [];
      }
    });
  }

  removeChat(chatId: string) {
    runInAction(() => {
      this.chats = this.chats.filter((chat) => chat._id !== chatId);

      if (this.selectedChat?._id === chatId) {
        this.selectedChat = null;
        this.messages = [];
        this.pinnedMessages = [];
        this.opponentId = undefined;
      }
    });
  }

  async fetchChat(chatId: string, myId: string) {
    try {
      const response = await this.chatService.fetchChatById(chatId);
      runInAction(() => {
        this.selectedChat = response.data;
        if (!response.data.isGroupChat) {
          this.opponentId = response.data?.users?.find(user => user._id !== myId)?._id
        }
        else {
          this.opponentId = undefined
        }
      });
    } catch (err) {
      console.error("Error fetching chat:", err);
    }
  }

  async hasUnreadMessages() {
    if (this.isApiCheckedNewMessages) return;
    try {
      const { data } = await this.chatService.hasUnreadMessages();
      this.root.onlineStore.setUnreadStatus(data);
    } catch (err) {
      console.error("Error fetching unread status:", err);
    } finally {
      runInAction(() => {
        this.isApiCheckedNewMessages = true;
      })
    };
  }

  async fetchChatMessages(chatId: string, skip: number = 0) {
    try {
      const response = await this.chatService.fetchChatMessages(chatId, skip);
      const incomingMessages = response.data.messages;

      runInAction(() => {
        const currentIds = new Set(this.messages.map((msg) => msg._id));

        const uniqueMessages = incomingMessages.filter((msg: any) => !currentIds.has(msg._id));

        if (skip === 0) {
          this.messages = incomingMessages;
        } else {
          this.messages = [...uniqueMessages, ...this.messages]; // ✅ Добавляем старые в начало
        }

        this.hasMoreMessages = incomingMessages.length === 30; // ✅ Если меньше 30, значит, больше нет
        this.updatePinnedFromMessages();
      });
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }

  setMessages(newMessages: MessageDTO[]) {
    runInAction(() => {
      this.messages = newMessages;
    });
  }

  async sendMessage(
    message: string,
    chatId: string,
    replyToMessageId?: string,
    images?: ImagePicker.ImagePickerAsset[],
    natalChart?: NatalChartPayload,
    natalChartSignature?: string,
    lang?: string,
  ) {
    try {
      // Forward any cached natal chart data so the backend can associate it with this message.
      const { data } = await this.chatService.sendMessage(
        message,
        chatId,
        replyToMessageId,
        images,
        natalChart,
        natalChartSignature,
        lang,
      );

      const messageData = {
        _id: data.data._id,
        sender: data.data.sender,
        content: data.data.content,
        chat: data.data.chat,
        createdAt: data.data.createdAt,
        ...(!isEmpty(data.data.replyTo) && { replyTo: data.data.replyTo }),
        ...(data.data.images && { images: data.data.images }),
        ...(data.data.attachments && { attachments: data.data.attachments }),
      };

      runInAction(() => {
        this.messages.push(messageData as any);
      });
    } catch (err) {
      this.root.uiStore.showSnackbar(
        i18n.t("stores.chat.snackbar.sendFailed"), // ⬅️ локализовано
        "error"
      );
      console.error("Error sending message:", err); // ⬅️ было по-русски
    }
  }

  async editMessage(messageId: string, content: string) {
    try {
      const { data } = await this.chatService.editMessage(messageId, content);
      this.root.onlineStore.emitEditedMessage(data.data)

      runInAction(() => {
        const index = this.messages.findIndex((msg) => msg._id === messageId);
        if (index !== -1) {
          this.messages[index].content = content;
          this.messages[index].isEdited = true;
        }
      });
    } catch (err) {
      console.error("Error editing message:", err);
    }
  }

  async deleteMessage(messageId: string) {
    try {
      const { data } = await this.chatService.deleteMessage(messageId);
      const updatedMessage = data.data;

      runInAction(() => {
        this.applyMessageDeletion(messageId, {
          ...updatedMessage,
          status: updatedMessage?.status ?? 'deleted',
          content: updatedMessage?.content ?? 'deleted',
          attachments: [],
          images: [],
        });
        this.updatePinnedFromMessages();
      });
    } catch (err) {
      console.error("Error deleting message:", err);
      throw err;
    }
  }

  async clearChatHistory(chatId: string) {
    try {
      await this.chatService.clearChatHistory(chatId);

      runInAction(() => {
        this.messages = [];
        this.pinnedMessages = [];
        this.hasMoreMessages = false;

        if (this.selectedChat?._id === chatId && this.selectedChat) {
          this.selectedChat = { ...this.selectedChat, latestMessage: undefined };
        }

        const chatIndex = this.chats.findIndex(chat => chat._id === chatId);
        if (chatIndex !== -1) {
          const updatedChat = { ...this.chats[chatIndex] } as any;
          delete updatedChat.latestMessage;
          this.chats[chatIndex] = updatedChat;
        }
      });
    } catch (err) {
      console.error("Error clearing chat history:", err);
      throw err;
    }
  }

  async deleteChat(chatId: string) {
    try {
      await this.chatService.deleteChat(chatId);
      this.removeChat(chatId);
    } catch (err) {
      console.error("Error deleting chat:", err);
      throw err;
    }
  }

  subscribeToChats() {
    if (!this.root.onlineStore.socket) return;
    console.log("📲 Подписываюсь на список чатов...");
    // важно: снять старый хендлер перед повторной подпиской
    this.root.onlineStore.socket.off('newMessageFromChats', this.handleNewMessageFromChats);
    this.root.onlineStore.socket.on('newMessageFromChats', this.handleNewMessageFromChats);
  }

  unsubscribeFromChats() {
    if (!this.root.onlineStore.socket) return;
    console.log("🚪 Отписываюсь от списка чатов...");
    this.root.onlineStore.socket.off('newMessageFromChats', this.handleNewMessageFromChats);
  }

  subscribeToChat(chatId: string) {
    if (!this.root.onlineStore.socket) return;

    // если уже подписаны на этот же чат — ничего не делаем
    if (this.currentChatSubscribedId === chatId) return;

    // перед подпиской снимаем ВСЕ связанные хендлеры (на случай переезда между чатами)
    this.root.onlineStore.socket.off("typing", this.root.onlineStore.handleTyping);
    this.root.onlineStore.socket.off("stop typing", this.root.onlineStore.handleStopTyping);
    this.root.onlineStore.socket.off('server-message:new', this.handleNewMessage);
    this.root.onlineStore.socket.off('editedMessage', this.handleEditedMessage);
    this.root.onlineStore.socket.off('server-message:read', this.handleMarkAsRead);
    this.root.onlineStore.socket.off('server-message:deleted', this.handleDeletedMessage);

    this.root.onlineStore.socket.on("typing", this.root.onlineStore.handleTyping);
    this.root.onlineStore.socket.on("stop typing", this.root.onlineStore.handleStopTyping);
    this.root.onlineStore.socket.on('server-message:new', this.handleNewMessage);
    this.root.onlineStore.socket.on('editedMessage', this.handleEditedMessage);
    this.root.onlineStore.socket.on('server-message:read', this.handleMarkAsRead);
    this.root.onlineStore.socket.on('server-message:deleted', this.handleDeletedMessage);

    this.currentChatSubscribedId = chatId;
  }

  unsubscribeFromChat(_chatId?: string) {
    if (!this.root.onlineStore.socket) return;
    this.root.onlineStore.socket.off("typing", this.root.onlineStore.handleTyping);
    this.root.onlineStore.socket.off("stop typing", this.root.onlineStore.handleStopTyping);
    this.root.onlineStore.socket.off('server-message:new', this.handleNewMessage);
    this.root.onlineStore.socket.off('editedMessage', this.handleEditedMessage);
    this.root.onlineStore.socket.off('server-message:read', this.handleMarkAsRead);
    this.root.onlineStore.socket.off('server-message:deleted', this.handleDeletedMessage);
    this.currentChatSubscribedId = null;
  }

  private handleNewMessageFromChats = (updatedChat: any) => {
    const isMyUnread = updatedChat?.unread?.userToId === this.root.authStore.getMyId();

    runInAction(() => {
      const existingChat = this.chats.find(chat => chat._id === updatedChat._id);
      const unread = (isMyUnread && updatedChat.unread) ?? null;

      const mergedChat = existingChat
        ? {
          ...existingChat,
          ...updatedChat,
          latestMessage: updatedChat.latestMessage ?? existingChat.latestMessage,
          unread,
        }
        : { ...updatedChat, unread };

      const remainingChats = this.chats.filter(chat => chat._id !== updatedChat._id);
      this.chats = [mergedChat, ...remainingChats];
    });
  };


  private handleNewMessage = (payload: any) => {
    // сервер может прислать либо объект latestMessage, либо готовое сообщение
    const incoming = payload?.latestMessage ?? payload;
    if (!incoming) return;

    const myId = this.root.authStore.getMyId?.();
    const isMyOwn = myId && incoming?.sender?._id === myId;
    if (isMyOwn) return;

    const incomingChatId =
      typeof incoming.chat === 'string' ? incoming.chat : incoming?.chat?._id;

    if (this.selectedChat?._id !== incomingChatId) return;

    runInAction(() => {
      const exists = this.messages.some(m => m._id === incoming._id);
      if (!exists) {
        this.messages.push(incoming);
      }
    });
  };

  private handleEditedMessage = (updatedMessage: any) => {
    runInAction(() => {
      const index = this.messages.findIndex(m => m._id === updatedMessage._id);
      if (index !== -1) {
        this.messages.splice(index, 1, {
          ...this.messages[index],
          ...updatedMessage,
        });
      }
    });
  }

  private handleDeletedMessage = (payload: { chatId: string; messageId: string; status?: 'deleted'; deletedBy: string }) => {
    const chatId = typeof payload?.chatId === 'string' ? payload.chatId : undefined;
    if (!chatId || this.selectedChat?._id !== chatId) return;

    runInAction(() => {
      this.applyMessageDeletion(payload.messageId, {
        status: payload.status ?? 'deleted',
        content: 'deleted',
      });
      this.updatePinnedFromMessages();
    });
  };

  private handleMarkAsRead = (data: ReadedMessageResponse) => {
    if (data.senderId === this.opponentId) {
      runInAction(() => {
        this.lastReadedMessage = data
      });
    }
  };

  async markChatAsRead({ chatId, messageId }: { chatId: string, messageId: string }) {
    try {
      await this.chatService.markChatAsRead(chatId, messageId);
      this.root.onlineStore.emitWasReaded({ chatId, messageId })

      runInAction(() => {
        this.chats = [...this.chats.map(chat =>
          chat._id === chatId
            ? { ...chat, unread: 0 }
            : chat
        )];
      });

    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  }

  async startInitialChats(userIds?: string[]) {
    if (!userIds?.length) return;

    const pendingUserIds = userIds.filter((id) => id && !this.startedInitialChatsFor.has(id));

    if (!pendingUserIds.length) return;

    pendingUserIds.forEach((id) => this.startedInitialChatsFor.add(id));

    await Promise.all(
      pendingUserIds.map(async (id) => {
        try {
          await this.messageById(id);
        } catch (error) {
          console.error(`Failed to start chat with user ${id}:`, error);
          this.startedInitialChatsFor.delete(id);
        }
      }),
    );
  }

  async messageById(id: string) {
    return await this.chatService.messageByIdRequest(id);
  }

  async reportMessage(messageId: string) {
    return await this.chatService.reportMessage(messageId);
  }

  async getLastReadedMessage(props: { userId: string, chatId: string }) {
    const lastReadedMessage = await this.chatService.fetchLastReadedMessageRequest(props);
    runInAction(() => {
      this.lastReadedMessage = lastReadedMessage.data
    });
  }

}
