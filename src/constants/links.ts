import Constants from 'expo-constants';

export const isDev = process.env.NODE_ENV === "development";

export const BASE_URL = isDev
  ? "http://192.168.0.20:5001/"
  : "https://aipair.pro/";
  

export const TELEGRAM_URL = 'https://t.me/pllacesupport';
export const DOMAIN = "https://AiPair.pro"
export const API_URL = `${BASE_URL}api/`;


export const EMAIL = "AiPairPro@yandex.com";

export const SITE_NAME = "AiPair";


export const appVersion = Constants.expoConfig?.version || '1.0.0';

export const GOOGLE_SIGN_IN_CLIENT_ID = '456854793341-84m49fc93a72cq148bftkgthn03tijdt.apps.googleusercontent.com' // из Google Cloud Console fingerPrint