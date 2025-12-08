export type AppVersionConfig = {
  minVersion: string;
  latestVersion: string;
  iosStoreUrl: string;
  androidStoreUrl: string;
};

export type ChatLimitConfig = {
  messageLimit: number;
  cooldownMs: number;
  tokenCost: number;
  scope?: 'chat' | 'global';
};

export type AdsConfig = {
  ADS_ENABLED: boolean;
  ADS_ENABLED_ANDROID?: boolean;
  ADS_ENABLED_IOS?: boolean;
  ANDROID_AD_UNIT_ID_BANNER: string;
  ANDROID_AD_UNIT_ID_REWARD: string;
  IOS_AD_UNIT_ID_BANNER: string;
  IOS_AD_UNIT_ID_REWARD: string;
  TOKEN_REWARD_AMOUNT: number;
};

export type AppConfigResponse = {
  API_URL?: string;
  appVer: Partial<AppVersionConfig>;
  ads?: Partial<AdsConfig>;
  chatLimit?: Partial<ChatLimitConfig>;
  urls?: Record<string, any>;
};

export type NormalizedAppConfig = {
  appVer: AppVersionConfig;
  ads: AdsConfig;
  chatLimit: ChatLimitConfig;
  urls?: any;
};
