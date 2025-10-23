import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, View } from 'react-native';
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
import { AiBotListSection } from '../../../components/aibot/AiBotListSection';
import { getAiBotIdentifier, type AiBotCardEntity } from '../../../components/aibot/AiBotCard';

// NB: этот экран обёрнут withAuthGuard в ProfileStack, поэтому доступен только авторизованным пользователям.
type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  typeof ROUTES.Profile
>;

export const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();
  const { setColors } = useSafeAreaColors();
  const { goToMain, goToAiBotProfile } = usePortalNavigation();

  const { authStore, profileStore, notificationStore, onlineStore, uiStore, aiBotStore } = useRootStore();

  const authUser = useStoreData(authStore, (store) => store.user);
  const isAuthenticated = useStoreData(authStore, (store) => store.isAuthenticated);
  const profile = useStoreData(profileStore, (store) => store.myProfile);
  const notificationsCount = useStoreData(notificationStore, (store) => store.notificationsCount);
  const hasRealtimeNotification = useStoreData(onlineStore, (store) => store.hasUserNotification);
  const hasUnreadMessage = useStoreData(onlineStore, (store) => store.hasUserNewMessage);
  const myBots = useStoreData(aiBotStore, (store) => store.myBots);
  const subscribedBots = useStoreData(aiBotStore, (store) => store.subscribedBots);
  const isLoadingMyBots = useStoreData(aiBotStore, (store) => store.isLoadingMyBots);
  const isLoadingSubscribedBots = useStoreData(aiBotStore, (store) => store.isLoadingSubscribedBots);

  const profileId = profile?._id ?? authUser?.id ?? '';
  const isOnline = useStoreData(
    onlineStore,
    (store) => (profileId ? store.getIsUserOnline(profileId) : false),
  );

  const scrollViewRef = useRef<ScrollView | null>(null);
  const myBotsOffsetRef = useRef(0);
  const subscribedBotsOffsetRef = useRef(0);
  const myBotsMeasuredRef = useRef(false);
  const subscribedBotsMeasuredRef = useRef(false);

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

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!myBots.length) {
      void aiBotStore.fetchMyAiBots();
    }

    if (!subscribedBots.length) {
      void aiBotStore.fetchSubscribedAiBots();
    }
  }, [aiBotStore, isAuthenticated, myBots.length, subscribedBots.length]);

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

  const scrollToOffset = useCallback((offset: number, measured: boolean) => {
    const targetOffset = measured ? Math.max(0, offset - 16) : 0;
    scrollViewRef.current?.scrollTo({ y: targetOffset, animated: true });
  }, []);

  const handleOpenMyBotsSection = useCallback(() => {
    scrollToOffset(myBotsOffsetRef.current, myBotsMeasuredRef.current);
  }, [scrollToOffset]);

  const handleOpenSubscriptionsSection = useCallback(() => {
    scrollToOffset(subscribedBotsOffsetRef.current, subscribedBotsMeasuredRef.current);
  }, [scrollToOffset]);

  const handleMyBotsLayout = useCallback((event: LayoutChangeEvent) => {
    myBotsOffsetRef.current = event.nativeEvent.layout.y;
    myBotsMeasuredRef.current = true;
  }, []);

  const handleSubscribedBotsLayout = useCallback((event: LayoutChangeEvent) => {
    subscribedBotsOffsetRef.current = event.nativeEvent.layout.y;
    subscribedBotsMeasuredRef.current = true;
  }, []);

  const handleOpenBotProfile = useCallback((bot: AiBotCardEntity) => {
    const botId = getAiBotIdentifier(bot);
    if (!botId) {
      uiStore.showSnackbar('Не удалось открыть профиль бота', 'error');
      return;
    }
    goToAiBotProfile(botId);
  }, [goToAiBotProfile, uiStore]);

  const canGoBack = navigation.canGoBack();

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}
    >
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
        onOpenAiBots={handleOpenMyBotsSection}
        onOpenBots={handleOpenSubscriptionsSection}
        onLearnMorePress={handleFeatureSoon}
        hasNotifications={hasNotifications}
      />
      <View style={styles.sectionsWrapper}>
        <View onLayout={handleMyBotsLayout}>
          <AiBotListSection
            title="Мои AI-боты"
            bots={myBots}
            isLoading={isLoadingMyBots}
            emptyText="Вы еще не создали AI-ботов. Попробуйте создать первого героя!"
            onBotPress={handleOpenBotProfile}
          />
        </View>
        <View onLayout={handleSubscribedBotsLayout}>
          <AiBotListSection
            title="AI-боты, на которых я подписан"
            bots={subscribedBots}
            isLoading={isLoadingSubscribedBots}
            emptyText="Вы пока не подписались ни на одного AI-бота."
            onBotPress={handleOpenBotProfile}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  sectionsWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 24,
  },
});
