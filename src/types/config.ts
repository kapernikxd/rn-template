export type AppVersionConfig = {
  minVersion: string;
  latestVersion: string;
  iosStoreUrl: string;
  androidStoreUrl: string;
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
  appVer: Partial<AppVersionConfig>;
  ads?: Partial<AdsConfig>;
  urls?: any;
};

export type NormalizedAppConfig = {
  appVer: AppVersionConfig;
  ads: AdsConfig;
  urls?: any;
};
