import { AuthStore } from './mobx/AuthStore';
import { ProfileStore } from './mobx/ProfileStore';
import { ChatStore } from './mobx/ChatStore';
import { UiStore } from './mobx/UiStore';
import { OnlineStore } from './mobx/OnlineStore';
import { NotificationStore } from './mobx/NotificationStore';

export class RootStore {
  readonly authStore: AuthStore;
  readonly profileStore: ProfileStore;
  readonly chatStore: ChatStore;
  readonly uiStore: UiStore;
  readonly onlineStore: OnlineStore;
  readonly notificationStore: NotificationStore;

  constructor() {
    this.authStore = new AuthStore(this);
    this.profileStore = new ProfileStore(this);
    this.chatStore = new ChatStore(this);
    this.uiStore = new UiStore(this);
    this.onlineStore = new OnlineStore(this);
    this.notificationStore = new NotificationStore(this);
  }
}
