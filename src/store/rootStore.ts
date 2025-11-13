import { AuthStore } from './mobx/AuthStore';
import { ProfileStore } from './mobx/ProfileStore';
import { ChatStore } from './mobx/ChatStore';
import { UiStore } from './mobx/UiStore';
import { OnlineStore } from './mobx/OnlineStore';
import { NotificationStore } from './mobx/NotificationStore';
import { AiBotStore } from './mobx/AiBotStore';
import { IdentityStore } from './mobx/IdentityStore';
import { ImageGenerationStore } from './mobx/ImageGenerationStore';
import { ConfigStore } from './mobx/ConfigStore';

export class RootStore {
  readonly authStore: AuthStore;
  readonly profileStore: ProfileStore;
  readonly chatStore: ChatStore;
  readonly uiStore: UiStore;
  readonly onlineStore: OnlineStore;
  readonly notificationStore: NotificationStore;
  readonly aiBotStore: AiBotStore;
  readonly identityStore: IdentityStore;
  readonly imageGenerationStore: ImageGenerationStore;
  readonly configStore: ConfigStore;
  constructor() {
    this.authStore = new AuthStore(this);
    this.profileStore = new ProfileStore(this);
    this.chatStore = new ChatStore(this);
    this.uiStore = new UiStore(this);
    this.onlineStore = new OnlineStore(this);
    this.notificationStore = new NotificationStore(this);
    this.aiBotStore = new AiBotStore(this);
    this.identityStore = new IdentityStore();
    this.imageGenerationStore = new ImageGenerationStore();
    this.configStore = new ConfigStore(this);
  }
}
