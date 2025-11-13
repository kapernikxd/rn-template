import { makeAutoObservable, runInAction } from "mobx";

import { DEFAULT_ADS_CONFIG, DEFAULT_APP_VERSION_CONFIG } from "../../constants/links";
import type { NormalizedAppConfig, AdsConfig, AppVersionConfig } from "../../types/config";
import { AppConfigService } from "../../services/config/AppConfigService";
import { BaseStore, type StoreListener } from "./BaseStore";
import { RootStore } from "../rootStore";

export class ConfigStore {
  private readonly baseStore = new BaseStore();
  readonly subscribe: (listener: StoreListener) => () => void;
  private readonly root: RootStore;

  private config: NormalizedAppConfig = {
    appVer: { ...DEFAULT_APP_VERSION_CONFIG },
    add: { ...DEFAULT_ADS_CONFIG },
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

  get adsConfig(): AdsConfig {
    return this.config.add;
  }

  get adsEnabled(): boolean {
    return this.adsConfig.ADS_ENABLED;
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
        this.config = {
          appVer: { ...DEFAULT_APP_VERSION_CONFIG, ...response.appVer },
          add: { ...DEFAULT_ADS_CONFIG, ...(response.add ?? {}) },
        };
        this.loading = false;
      });
    } catch (error) {
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
