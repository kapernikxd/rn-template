import { useState, useEffect, useRef, useCallback } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform, AppState } from "react-native";

export interface PushNotificationState {
  expoPushToken?: string;
  notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState & {
  registerForPushNotificationsAsync: () => Promise<string | undefined>;
} => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  // ✅ актуальный тип
  const notificationListener = useRef<Notifications.Subscription | null>(null);

  const registerForPushNotificationsAsync = useCallback(async () => {
    // Опционально верни проверку реального девайса (симулятор iOS не даст токен)
    // if (!Device.isDevice) {
    //   console.warn("Must use physical device for Push Notifications");
    //   return;
    // }

    // Разрешения
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        // iOS: можно добавить provisional: true, если нужно тихое разрешение
      });
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Failed to get permission for push notifications");
      return;
    }

    // Проектный ID
    const projectId =
      Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn("No EAS projectId configured. Set it in app.json/app.config.ts");
      return;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      setExpoPushToken(tokenData.data);
      return tokenData.data;
    } catch (err) {
      console.error("getExpoPushTokenAsync error:", err);
      return;
    }
  }, []);

  const configureNotificationChannel = useCallback(async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  }, []);

  useEffect(() => {
    // ✅ только поддерживаемые поля
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldShowAlert: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // init
    (async () => {
      await configureNotificationChannel();
      await registerForPushNotificationsAsync();
    })();

    // слушатель входящих уведомлений
    notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
      setNotification(notif);
    });

    return () => {
      notificationListener.current?.remove();
    };
  }, [registerForPushNotificationsAsync, configureNotificationChannel]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === "granted" && !expoPushToken) {
          await registerForPushNotificationsAsync();
        }
      }
    });

    return () => subscription.remove();
  }, [expoPushToken, registerForPushNotificationsAsync]);

  return { expoPushToken, notification, registerForPushNotificationsAsync };
};
