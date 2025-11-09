import AppMetrica from '@appmetrica/react-native-analytics';

import { APP_METRICA } from '../../constants/links';

let isActivated = false;

export const initAppMetrica = () => {
  if (isActivated || !APP_METRICA) {
    return;
  }

  AppMetrica.activate({
    apiKey: APP_METRICA,
    sessionTimeout: 120,
    logs: __DEV__,
  });

  isActivated = true;
};

export const reportAppOpen = () => {
  if (!APP_METRICA) {
    return;
  }

  if (!isActivated) {
    initAppMetrica();
  }

  AppMetrica.reportAppOpen();
};
