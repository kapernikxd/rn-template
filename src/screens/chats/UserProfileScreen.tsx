import React, { useCallback, useEffect, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { LoadingScreen, ProfileCard } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';

import { usePortalNavigation } from '../../helpers/hooks';
import { getUserAvatar, getUserFullName } from '../../helpers/utils/user';
import { formatLastSeen } from '../../helpers/utils/date';
import { useRootStore, useStoreData } from '../../store/StoreProvider';
import { useSafeAreaColors } from '../../store/SafeAreaColorProvider';
import { ROUTES, type ChatsStackParamList } from '../../navigation/types';
import type { ProfileDTO } from '../../types';

type UserProfileRoute = RouteProp<ChatsStackParamList, typeof ROUTES.UserProfile>;

export const UserProfileScreen = () => {
  const route = useRoute<UserProfileRoute>();
  const { theme } = useTheme();
  const { setColors } = useSafeAreaColors();
  const { goToProfile, goBack, canGoBack } = usePortalNavigation();

  const userId = route.params?.userId ?? '';

  const { profileStore, authStore, onlineStore, uiStore } = useRootStore();

  const profile = useStoreData(profileStore, (store) => store.profile);
  const isLoadingProfile = useStoreData(profileStore, (store) => store.isLoadingProfile);
  const isAuthenticated = useStoreData(authStore, (store) => store.isAuthenticated);
  const myId = useStoreData(authStore, (store) => store.user?.id ?? null);
  const isOnline = useStoreData(onlineStore, (store) => (userId ? store.getIsUserOnline(userId) : false));

  useEffect(() => {
    setColors({
      topColor: theme.backgroundLight,
      bottomColor: theme.white,
    });
  }, [setColors, theme]);

  useEffect(() => {
    if (!userId) return;

    if (myId && userId === myId) {
      goToProfile(userId);
      return;
    }

    profileStore.clearViewedProfile();
    void profileStore.fetchProfileById(userId);

    return () => {
      profileStore.clearViewedProfile();
    };
  }, [goToProfile, myId, profileStore, userId]);

  const currentProfile = profile as ProfileDTO | undefined;

  const displayName = useMemo(() => {
    const fullName = currentProfile ? getUserFullName(currentProfile) : '';
    const fallback = fullName.trim();
    return fallback || 'Profile';
  }, [currentProfile]);

  const imageUri = useMemo(() => {
    return getUserAvatar(currentProfile ?? ({} as ProfileDTO));
  }, [currentProfile]);

  const lastSeenText = useMemo(() => {
    return currentProfile?.lastSeen ? formatLastSeen(currentProfile.lastSeen) : undefined;
  }, [currentProfile?.lastSeen]);

  const handleFeatureSoon = useCallback(() => {
    uiStore.showSnackbar('This feature will be available soon.', 'info');
  }, [uiStore]);

  const handleFollowToggle = useCallback(() => {
    if (!userId) return;
    void profileStore.followProfile(userId);
  }, [profileStore, userId]);

  const handleGoBack = useCallback(() => {
    if (canGoBack()) {
      goBack();
    }
  }, [canGoBack, goBack]);

  if (isLoadingProfile) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: theme.background }}>
      <ProfileCard
        name={displayName}
        imageUri={imageUri}
        isAuth={isAuthenticated}
        isMe={false}
        isOnline={isOnline}
        lastSeenText={lastSeenText}
        onBack={canGoBack() ? handleGoBack : undefined}
        onLearnMorePress={handleFeatureSoon}
        onMessage={handleFeatureSoon}
        onFollowToggle={handleFollowToggle}
        isFollowing={currentProfile?.isFollowing}
      />
    </ScrollView>
  );
};
