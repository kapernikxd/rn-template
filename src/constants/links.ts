import Constants from 'expo-constants';

export const isDev = process.env.NODE_ENV === "development";

export const BASE_URL = isDev
  ? "http://192.168.0.20:5001/"
  : "https://aipair.pro/";

const ensureTrailingSlash = (url: string) => (url.endsWith("/") ? url : `${url}/`);

export const DEFAULT_API_URL = `${BASE_URL}api/`;

export let API_URL = DEFAULT_API_URL;

type ApiUrlListener = (url: string) => void;
const apiUrlListeners: ApiUrlListener[] = [];

export const onApiUrlChange = (listener: ApiUrlListener) => {
  apiUrlListeners.push(listener);
  listener(API_URL);

  return () => {
    const listenerIndex = apiUrlListeners.indexOf(listener);
    if (listenerIndex !== -1) {
      apiUrlListeners.splice(listenerIndex, 1);
    }
  };
};

export const setApiUrl = (url?: string | null) => {
  if (isDev || !url) {
    API_URL = DEFAULT_API_URL;
  } else {
    API_URL = ensureTrailingSlash(url);
  }

  apiUrlListeners.forEach((listener) => listener(API_URL));
};


export const DOMAIN = "https://AiPair.pro"
export const CONFIG_SERVER_URL = "https://config.webbro.org/";


export const EMAIL = "AiPairPro@yandex.com";

export const SITE_NAME = "AiAstrology";
export const CONFIG_APP_ID = "aiastrology";

export const APP_METRICA = "40e3a66a-2488-4dc3-b544-7ba1c72ba5f1"

export const appVersion = Constants.expoConfig?.version || '1.0.0';

export const GOOGLE_SIGN_IN_CLIENT_ID = '456854793341-f96jb6ks2q6pm18q9b5tmj869j4rb5mg.apps.googleusercontent.com' // из Google Cloud Console web

export const DEFAULT_TOKEN_BALANCE = 20;

export const DEFAULT_APP_VERSION_CONFIG = {
  minVersion: "1.0.0",
  latestVersion: "1.0.0",
  iosStoreUrl: "https://apps.apple.com/us/app/pllace/id6746166742",
  androidStoreUrl: "https://play.google.com/store/apps/details?id=com.kapernikrs.aiastrology",
};

export const DEFAULT_ADS_CONFIG = {
  ADS_SOURCE: "GOOGLE" as const,
  ADS_ENABLED: false,
  ADS_ENABLED_ANDROID: false,
  ADS_ENABLED_IOS: false,
  ANDROID_AD_UNIT_ID_BANNER: 'ca-app-pub-4139428747088857/7598881852',
  ANDROID_AD_UNIT_ID_REWARD: 'ca-app-pub-4139428747088857/4546887692',
  IOS_AD_UNIT_ID_BANNER: 'ca-app-pub-4139428747088857/2439599105',
  IOS_AD_UNIT_ID_REWARD: 'ca-app-pub-4139428747088857/8813435767',
  YANDEX_ANDROID_AD_UNIT_ID_BANNER: 'R-M-17968689-1',
  YANDEX_ANDROID_AD_UNIT_ID_REWARD: 'R-M-17968689-2',
  YANDEX_IOS_AD_UNIT_ID_BANNER: 'demo-banner-yandex',
  YANDEX_IOS_AD_UNIT_ID_REWARD: 'demo-rewarded-yandex',
  TOKEN_REWARD_AMOUNT: 10,
};

