export type AppVersionConfig = {
  minVersion: string;
  latestVersion: string;
  iosStoreUrl: string;
  androidStoreUrl: string;
};

export type AdsConfig = {
  ADS_ENABLED: boolean;
  ANDROID_AD_UNIT_ID_BANNER: string;
  ANDROID_AD_UNIT_ID_REWARD: string;
  IOS_AD_UNIT_ID_BANNER: string;
  IOS_AD_UNIT_ID_REWARD: string;
  TOKEN_REWARD_AMOUNT: number;
};

export type AppConfigResponse = {
  appVer: Partial<AppVersionConfig>;
  add?: Partial<AdsConfig>;
};

export type NormalizedAppConfig = {
  appVer: AppVersionConfig;
  add: AdsConfig;
};
