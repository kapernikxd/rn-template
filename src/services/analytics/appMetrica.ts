import { Linking } from "react-native";
import AppMetrica from "@appmetrica/react-native-analytics";
import { APP_METRICA } from "../../constants/links";

let isActivated = false;

export const initAppMetrica = () => {
  if (isActivated || !APP_METRICA) return;

  AppMetrica.activate({
    apiKey: APP_METRICA,
    sessionTimeout: 120,
    logs: __DEV__,
  });

  isActivated = true;
};

export const reportAppOpen = async () => {
  if (!APP_METRICA) return;

  if (!isActivated) initAppMetrica();

  const url = await Linking.getInitialURL();

  if (url && url.trim()) {
    AppMetrica.reportAppOpen(url);
  }
};
