import React, { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileCard } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';

import { usePortalNavigation } from '../../../helpers/hooks';
import { getUserAvatar, getUserFullName } from '../../../helpers/utils/user';
import { useRootStore, useStoreData } from '../../../store/StoreProvider';
import { ROUTES, type ProfileStackParamList } from '../../../navigation/types';
import { useSafeAreaColors } from '../../../store/SafeAreaColorProvider';

// NB: этот экран обёрнут withAuthGuard в ProfileStack, поэтому доступен только авторизованным пользователям.
type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  typeof ROUTES.Profile
>;

export const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();
  const { setColors } = useSafeAreaColors();
  const { goToMain } = usePortalNavigation();

  const { authStore, profileStore, notificationStore, onlineStore, uiStore } = useRootStore();

  const authUser = useStoreData(authStore, (store) => store.user);
  const isAuthenticated = useStoreData(authStore, (store) => store.isAuthenticated);
  const profile = useStoreData(profileStore, (store) => store.myProfile);
  const notificationsCount = useStoreData(notificationStore, (store) => store.notificationsCount);
  const hasRealtimeNotification = useStoreData(onlineStore, (store) => store.hasUserNotification);
  const hasUnreadMessage = useStoreData(onlineStore, (store) => store.hasUserNewMessage);

  const profileId = profile?._id ?? authUser?.id ?? '';
  const isOnline = useStoreData(
    onlineStore,
    (store) => (profileId ? store.getIsUserOnline(profileId) : false),
  );

  useEffect(() => {
    setColors({
      topColor: theme.backgroundLight,
      bottomColor: theme.white,
    });
  }, [theme, setColors, isDark]);

  useEffect(() => {
    if (isAuthenticated && !profile?._id) {
      void profileStore.fetchMyProfile();
    }
  }, [isAuthenticated, profile?._id, profileStore]);

  useEffect(() => {
    if (isAuthenticated) {
      void notificationStore.fetchLastNotifications();
    }
  }, [isAuthenticated, notificationStore]);

  const imageUri = useMemo(() => getUserAvatar(profile), [profile]);
  const displayName = useMemo(() => {
    const fullName = getUserFullName(profile);
    if (fullName) return fullName;
    if (authUser?.fullName) return authUser.fullName;
    if (authUser?.name) return authUser.name;
    return 'Profile';
  }, [authUser, profile]);

  const hasNotifications = useMemo(
    () => Boolean(notificationsCount > 0 || hasRealtimeNotification || hasUnreadMessage),
    [hasRealtimeNotification, hasUnreadMessage, notificationsCount],
  );

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleOpenSettings = useCallback(() => {
    navigation.navigate(ROUTES.ProfileSettings);
  }, [navigation]);

  const handleOpenChats = useCallback(() => {
    goToMain(ROUTES.ChatsTab);
  }, [goToMain]);

  const handleFeatureSoon = useCallback(() => {
    uiStore.showSnackbar('This feature will be available soon.', 'info');
  }, [uiStore]);

  const canGoBack = navigation.canGoBack();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: theme.background }}>
      <ProfileCard
        name={displayName}
        imageUri={imageUri}
        isAuth={isAuthenticated}
        isMe
        isOnline={isOnline}
        onBack={canGoBack ? handleGoBack : undefined}
        onOpenSettings={handleOpenSettings}
        onOpenActivity={handleOpenChats}
        onOpenSpecialist={handleFeatureSoon}
        onOpenCreatePoll={handleFeatureSoon}
        onOpenCreateEvent={handleFeatureSoon}
        onOpenAiBots={handleFeatureSoon}
        onOpenBots={handleFeatureSoon}
        onLearnMorePress={handleFeatureSoon}
        hasNotifications={hasNotifications}
      />
    </ScrollView>
  );
};
