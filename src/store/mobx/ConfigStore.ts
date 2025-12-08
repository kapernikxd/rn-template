import { makeAutoObservable, runInAction } from "mobx";
import { Platform } from "react-native";

import { DEFAULT_ADS_CONFIG, DEFAULT_APP_VERSION_CONFIG, setApiUrl } from "../../constants/links";
import { DEFAULT_CHAT_LIMIT_CONFIG } from "../../constants/ads";
import type { NormalizedAppConfig, AdsConfig, AppVersionConfig, ChatLimitConfig } from "../../types/config";
import { AppConfigService } from "../../services/config/AppConfigService";
import { BaseStore, type StoreListener } from "./BaseStore";
import { RootStore } from "../rootStore";

export class ConfigStore {
  private readonly baseStore = new BaseStore();
  readonly subscribe: (listener: StoreListener) => () => void;
  private readonly root: RootStore;

  private config: NormalizedAppConfig = {
    appVer: { ...DEFAULT_APP_VERSION_CONFIG },
    ads: { ...DEFAULT_ADS_CONFIG },
    chatLimit: { ...DEFAULT_CHAT_LIMIT_CONFIG },
    urls: {},
  };

  loading = false;
  error: string | null = null;
  private hasAttemptedFetch = false;

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

  get isInitialized() {
    return this.hasAttemptedFetch;
  }

  get appVersionConfig(): AppVersionConfig {
    return this.config.appVer;
  }

  get urls() {
    return this.config.urls;
  }

  get adsConfig(): AdsConfig {
    return this.config.ads;
  }

  get chatLimitConfig(): ChatLimitConfig {
    return this.config.chatLimit;
  }

  get adsEnabled(): boolean {
    const { ADS_ENABLED, ADS_ENABLED_ANDROID, ADS_ENABLED_IOS } = this.adsConfig;

    if (Platform.OS === "ios") {
      return ADS_ENABLED_IOS ?? ADS_ENABLED;
    }

    return ADS_ENABLED_ANDROID ?? ADS_ENABLED;
  }

  get tokenRewardAmount(): number {
    return this.adsConfig.TOKEN_REWARD_AMOUNT;
  }

  async fetchConfig(appId?: string) {
    this.loading = true;
    this.error = null;
    this.notify();

    try {
      const response = await AppConfigService.fetchConfig(appId);
      runInAction(() => {
        const apiUrlFromConfig = response.API_URL ?? response.urls?.API_URL ?? response.urls?.apiUrl;
        setApiUrl(apiUrlFromConfig);

        this.config = {
          appVer: { ...DEFAULT_APP_VERSION_CONFIG, ...response.appVer },
          ads: { ...DEFAULT_ADS_CONFIG, ...(response.ads ?? {}) },
          chatLimit: { ...DEFAULT_CHAT_LIMIT_CONFIG, ...(response.chatLimit ?? {}) },
          urls: { ...(response.urls ?? {}), ...(response.API_URL ? { API_URL: response.API_URL } : {}) }
        };
        this.loading = false;
      });
    } catch (error) {
      setApiUrl(null);
      runInAction(() => {
        this.loading = false;
        this.error = error instanceof Error ? error.message : String(error);
      });
    } finally {
      runInAction(() => {
        this.hasAttemptedFetch = true;
      });
      this.notify();
    }
  }

  async ensureConfigLoaded(appId?: string) {
    if (this.isInitialized || this.loading) {
      return;
    }

    await this.fetchConfig(appId);
  }
}
