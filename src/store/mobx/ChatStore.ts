import { makeAutoObservable, runInAction } from "mobx";
import ChatService from "../../services/chat/ChatService";
import * as ImagePicker from 'expo-image-picker';
import { RootStore } from "../rootStore";
import { ChatDTO, MessageDTO } from "../../types";
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

  isApiCheckedNewMessages = false;

  private currentChatSubscribedId: string | null = null;

  private chatService: ChatService;

  constructor(root: RootStore) {
    this.root = root;
    this.subscribe = this.baseStore.subscribe;
    makeAutoObservable(this, {
      baseStore: false,
      subscribe: false,
      notify: false,
      root: false,
    } as any);
    this.chatService = new ChatService();
  }

  private notify() {
    this.baseStore.notify();
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
    if (this.pinnedMessages.length >= 5) {
      this.root.uiStore.showSnackbar(
        'You can pin up to 5 messages. To pin a new message, remove one of the messages that are already pinned.',
        'info'
      );
      return;
    }

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

  async fetchChats(options?: FetchChatsOptions) {
    if (this.isLoadingChats || (!this.hasMoreChats && options?.page && options.page > 1)) return [];

    this.isLoadingChats = true;
    try {
      const response = await this.chatService.fetchChats(options);

      runInAction(() => {
        const incomingChats = response.data.chats;

        if (options?.page && options.page > 1) {
          const chatMap = new Map(this.chats.map((chat) => [chat._id, chat]));

          incomingChats.forEach((chat: ChatDTO) => {
            chatMap.set(chat._id, chat);
          });

          this.chats = Array.from(chatMap.values());
        } else {
          const chatMap = new Map<string, ChatDTO>();

          incomingChats.forEach((chat: ChatDTO) => {
            if (!chatMap.has(chat._id)) {
              chatMap.set(chat._id, chat);
            }
          });

          this.chats = Array.from(chatMap.values());
        }
        this.hasMoreChats = response.data.hasMore;
      });
      return response.data.chats.map((chat: any) => chat._id);
    } catch (err) {
      console.error("Ошибка при получении чатов:", err);
      return []
    } finally {
      runInAction(() => {
        this.isLoadingChats = false;
      });
    }
  }

  resetChatsPagination() {
    runInAction(() => {
      this.hasMoreChats = true;
      this.isLoadingChats = false;
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
      console.error("Ошибка при получении чата:", err);
    }
  }

  async hasUnreadMessages() {
    if (this.isApiCheckedNewMessages) return;
    try {
      const { data } = await this.chatService.hasUnreadMessages();
      this.root.onlineStore.setUnreadStatus(data);
    } catch (err) {
      console.error("Ошибка при получени непрочитанных:", err);
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
      console.error("Ошибка при получении сообщений:", err);
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
    images?: ImagePicker.ImagePickerAsset[]
  ) {
    try {
      const { data } = await this.chatService.sendMessage(
        message,
        chatId,
        replyToMessageId,
        images
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
      this.root.uiStore.showSnackbar("Failed", "error");
      console.error("Ошибка при отправке сообщения:", err);
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
      console.error("Ошибка при редактировании сообщения:", err);
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

    this.root.onlineStore.socket.on("typing", this.root.onlineStore.handleTyping);
    this.root.onlineStore.socket.on("stop typing", this.root.onlineStore.handleStopTyping);
    this.root.onlineStore.socket.on('server-message:new', this.handleNewMessage);
    this.root.onlineStore.socket.on('editedMessage', this.handleEditedMessage);
    this.root.onlineStore.socket.on('server-message:read', this.handleMarkAsRead);

    this.currentChatSubscribedId = chatId;
  }

  unsubscribeFromChat(_chatId?: string) {
    if (!this.root.onlineStore.socket) return;
    this.root.onlineStore.socket.off("typing", this.root.onlineStore.handleTyping);
    this.root.onlineStore.socket.off("stop typing", this.root.onlineStore.handleStopTyping);
    this.root.onlineStore.socket.off('server-message:new', this.handleNewMessage);
    this.root.onlineStore.socket.off('editedMessage', this.handleEditedMessage);
    this.root.onlineStore.socket.off('server-message:read', this.handleMarkAsRead);
    this.currentChatSubscribedId = null;
  }

  private handleNewMessageFromChats = (updatedChat: any) => {
    const isMyUnread = updatedChat?.unread?.userToId === this.root.authStore.getMyId();

    runInAction(() => {
      // 1. Обновляем массив
      const updatedChats = this.chats.map(chat =>
        chat._id === updatedChat._id
          ? { ...chat, latestMessage: updatedChat.latestMessage, unread: (isMyUnread && updatedChat.unread) ?? null }
          : chat
      );

      // 2. Сортируем по времени latestMessage
      this.chats = updatedChats.sort((a, b) => {
        const aTime = new Date(a.latestMessage?.createdAt || 0).getTime();
        const bTime = new Date(b.latestMessage?.createdAt || 0).getTime();
        return bTime - aTime;
      });
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
      console.error("Ошибка при пометке сообщений как прочитанных:", err);
    }
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
