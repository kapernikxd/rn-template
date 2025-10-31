import Constants from 'expo-constants';

export const isDev = process.env.NODE_ENV === "development";

export const ADS_ENABLED = true;

export const BASE_URL = isDev
  ? "http://192.168.0.20:5001/"
  : "https://aipair.pro/";
  

export const TELEGRAM_URL = 'https://t.me/pllacesupport';
export const DOMAIN = "https://AiPair.pro"
export const API_URL = `${BASE_URL}api/`;


export const EMAIL = "AiPairPro@yandex.com";

export const SITE_NAME = "AiPair";


export const appVersion = Constants.expoConfig?.version || '1.0.0';

export const GOOGLE_SIGN_IN_CLIENT_ID = '456854793341-f96jb6ks2q6pm18q9b5tmj869j4rb5mg.apps.googleusercontent.com' // из Google Cloud Console web

export const ANDROID_AD_UNIT_ID_BANNER = 'ca-app-pub-8636022279548301/8567360540';
export const ANDROID_AD_UNIT_ID_REWARD = 'ca-app-pub-8636022279548301/9133642229';

export const IOS_AD_UNIT_ID_BANNER = 'ca-app-pub-8636022279548301/7481186180';
export const IOS_AD_UNIT_ID_REWARD = 'ca-app-pub-8636022279548301/2111092392';

export const TOKEN_REWARD_AMOUNT = 10;