import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileCard, TabBar, type TabItem } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';

import { usePortalNavigation } from '../../../helpers/hooks';
import { getUserAvatar, getUserFullName } from '../../../helpers/utils/user';
import { useRootStore, useStoreData } from '../../../store/StoreProvider';
import { ROUTES, type ProfileStackParamList } from '../../../navigation/types';
import { useSafeAreaColors } from '../../../store/SafeAreaColorProvider';
import { type AiBotCardEntity } from '../../../components/aibot/AiBotCard';
import { getAiBotIdentifier } from '../../../helpers/utils/agent-create';
import { AiBotPlaceCardList } from '../../../components/aibot/AiBotPlaceCardList';

// NB: этот экран обёрнут withAuthGuard в ProfileStack, поэтому доступен только авторизованным пользователям.
type NavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  typeof ROUTES.Profile
>;

export const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark, typography } = useTheme();
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

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabs = useMemo<TabItem[]>(
    () => [
      { key: 'my-bots', label: 'Мои', icon: 'person' },
      { key: 'subscribed-bots', label: 'Подписки', icon: 'subscriptions' },
    ],
    [],
  );

  const scrollViewRef = useRef<ScrollView | null>(null);
  const botsSectionOffsetRef = useRef(0);
  const botsSectionMeasuredRef = useRef(false);

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

  const scrollToBotsSection = useCallback(() => {
    const targetOffset = botsSectionMeasuredRef.current
      ? Math.max(0, botsSectionOffsetRef.current - 16)
      : 0;
    scrollViewRef.current?.scrollTo({ y: targetOffset, animated: true });
  }, []);

  const handleOpenMyBotsSection = useCallback(() => {
    setActiveTabIndex(0);
    scrollToBotsSection();
  }, [scrollToBotsSection]);

  const handleOpenSubscriptionsSection = useCallback(() => {
    setActiveTabIndex(1);
    scrollToBotsSection();
  }, [scrollToBotsSection]);

  const handleBotsSectionLayout = useCallback((event: LayoutChangeEvent) => {
    botsSectionOffsetRef.current = event.nativeEvent.layout.y;
    botsSectionMeasuredRef.current = true;
  }, []);

  const handleOpenBotProfile = useCallback((bot: AiBotCardEntity) => {
    const botId = getAiBotIdentifier(bot);
    if (!botId) {
      uiStore.showSnackbar('Не удалось открыть профиль бота', 'error');
      return;
    }
    goToAiBotProfile(botId);
  }, [goToAiBotProfile, uiStore]);

  const handleTabChange = useCallback((index: number) => {
    setActiveTabIndex(index);
  }, []);

  const currentBots = useMemo(
    () => (activeTabIndex === 0 ? myBots : subscribedBots),
    [activeTabIndex, myBots, subscribedBots],
  );

  const isCurrentLoading = activeTabIndex === 0 ? isLoadingMyBots : isLoadingSubscribedBots;
  const currentEmptyText =
    activeTabIndex === 0
      ? 'Вы еще не создали AI-ботов. Попробуйте создать первого героя!'
      : 'Вы пока не подписались ни на одного AI-бота.';

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
        onOpenActivity={undefined}
        onOpenSpecialist={undefined}
        onOpenCreatePoll={undefined}
        onOpenCreateEvent={undefined}
        onOpenAiBots={undefined}
        onOpenBots={undefined}
        onLearnMorePress={undefined}
        hasNotifications={hasNotifications}
      />
      <View style={styles.sectionsWrapper} onLayout={handleBotsSectionLayout}>
        <TabBar tabs={tabs} activeTabIndex={activeTabIndex} onChangeTab={handleTabChange} style={styles.tabBar} />
        <AiBotPlaceCardList
          bots={currentBots}
          isLoading={isCurrentLoading}
          emptyText={currentEmptyText}
          onBotPress={handleOpenBotProfile}
        />
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
    // paddingHorizontal: 24,
    // paddingVertical: 24,
    // gap: 16,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  tabBar: {
    alignSelf: 'stretch',
  },
});
