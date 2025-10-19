import Constants from 'expo-constants';

export const isDev = process.env.NODE_ENV === "development";

export const BASE_URL = isDev
  ? "http://192.168.0.20:5001/"
  : "https://pllace.su/";
  

export const TELEGRAM_URL = 'https://t.me/pllacesupport';
export const DOMAIN = "https://pllace.su"
export const API_URL = `${BASE_URL}api/`;


export const EMAIL = "pllace.support@gmail.com";

export const SITE_NAME = "Pllace";


export const appVersion = Constants.expoConfig?.version || '1.0.0';
