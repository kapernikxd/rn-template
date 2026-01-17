import { useEffect } from 'react';
import { createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import { ROUTES, type RootStackParamList } from '../../navigation/types';

type PushNavigationData = {
  screen?: string;
};

export const pushNavigatorRef = createNavigationContainerRef<RootStackParamList>();

const waitForNavigationReady = async () => {
  let tries = 0;
  while (!pushNavigatorRef.isReady() && tries < 40) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    tries += 1;
  }
};

const handlePushNavigation = async (data?: PushNavigationData) => {
  if (!data?.screen) return;

  await waitForNavigationReady();

  switch (data.screen) {
    case 'horoscope':
      pushNavigatorRef.navigate(ROUTES.RootTabs, {
        screen: ROUTES.HoroscopeTab,
        params: {
          screen: ROUTES.Horoscope,
        },
      });
      break;
    default:
      break;
  }
};

export const usePushNavigator = () => {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as PushNavigationData | undefined;
      void handlePushNavigation(data);
    });

    void (async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        const data = response.notification.request.content.data as PushNavigationData | undefined;
        await handlePushNavigation(data);
      }
    })();

    return () => {
      subscription.remove();
    };
  }, []);
};
