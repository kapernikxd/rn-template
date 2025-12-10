import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';

import { useRootStore, useStoreData } from '../../../../store/StoreProvider';
import { usePortalNavigation, usePushNotifications } from '../../../../helpers/hooks';
import { NotificationSettingsFormValues } from './NotificationSettings.view';

export const useNotificationSettings = () => {
  const { profileStore, uiStore, authStore } = useRootStore();
  const hasAttemptedAutoLogin = useStoreData(
    authStore,
    (store) => store.hasAttemptedAutoLogin,
  );
  const isAuthenticated = useStoreData(authStore, (store) => store.isAuth);
  const isAuthReady = hasAttemptedAutoLogin && isAuthenticated;
  const { goBack } = usePortalNavigation();
  const { expoPushToken, registerForPushNotificationsAsync } = usePushNotifications();

  const [hasPermission, setHasPermission] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialSettings = useMemo(
    () => profileStore.myProfile?.pushNotificationSettings || {},
    [profileStore.myProfile?.pushNotificationSettings],
  );

  const methods = useForm<NotificationSettingsFormValues>({
    defaultValues: {
      likes: initialSettings.likes ?? false,
      followers: initialSettings.followers ?? false,
      groupMessages: initialSettings.groupMessages ?? true,
      participants: initialSettings.participants ?? false,
      newPost: initialSettings.newPost ?? true,
      invites: initialSettings.invites ?? true,
      pollAnswers: initialSettings.pollAnswers ?? true,
      pollInvites: initialSettings.pollInvites ?? true,
    },
  });

  const checkPermission = useCallback(async () => {
    if (!isAuthReady) {
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    if (granted && !expoPushToken) {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await authStore.sendPushToken(token);
      }
    }
  }, [authStore, expoPushToken, isAuthReady, registerForPushNotificationsAsync]);

  useFocusEffect(
    useCallback(() => {
      checkPermission();
    }, [checkPermission]),
  );

  const handlePermissionToggle = useCallback(
    async (value: boolean) => {
      if (!isAuthReady) {
        return;
      }

      if (value) {
        const { status } = await Notifications.requestPermissionsAsync();
        const granted = status === 'granted';
        setHasPermission(granted);
        if (granted) {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await authStore.sendPushToken(token);
          }
        }
      } else {
        Linking.openSettings();
        setHasPermission(false);
      }
    },
    [authStore, isAuthReady, registerForPushNotificationsAsync],
  );

  const sendPushToken = useCallback(async () => {
    if (!hasPermission || !isAuthReady) {
      return;
    }

    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await authStore.sendPushToken(token);
      }
    } catch (error) {
      console.error('Failed to send push token', error);
    }
  }, [authStore, hasPermission, isAuthReady, registerForPushNotificationsAsync]);

  const submit = useCallback(
    methods.handleSubmit(async data => {
      setIsSubmitting(true);
      try {
        await profileStore.updateProfile({
          pushNotificationSettings: data,
        });

        // Не блокируем завершение сабмита ожиданием пуш-токена, чтобы кнопка не висела в загрузке на iOS
        void sendPushToken();

        uiStore.showSnackbar('Updated', 'success');
      } catch {
        uiStore.showSnackbar('Failed', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }),
    [methods, profileStore, sendPushToken, uiStore],
  );

  const reset = useCallback(() => {
    methods.reset();
  }, [methods]);

  useEffect(() => {
    if (!profileStore.myProfile?._id) {
      profileStore.fetchMyProfile();
    }
  }, [profileStore, profileStore.myProfile?._id]);

  useEffect(() => {
    methods.reset({
      likes: initialSettings.likes ?? false,
      followers: initialSettings.followers ?? false,
      groupMessages: initialSettings.groupMessages ?? true,
      participants: initialSettings.participants ?? false,
      newPost: initialSettings.newPost ?? true,
      invites: initialSettings.invites ?? true,
      pollAnswers: initialSettings.pollAnswers ?? true,
      pollInvites: initialSettings.pollInvites ?? true,
    });
  }, [
    methods,
    initialSettings.likes,
    initialSettings.followers,
    initialSettings.groupMessages,
    initialSettings.participants,
    initialSettings.newPost,
    initialSettings.invites,
    initialSettings.pollAnswers,
    initialSettings.pollInvites,
  ]);

  return {
    methods,
    hasPermission,
    onPermissionToggle: handlePermissionToggle,
    onSubmit: submit,
    onReset: reset,
    onBackPress: goBack,
    isSubmitting,
    isAuthReady,
  };
};

