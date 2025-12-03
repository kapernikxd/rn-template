import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  ListRenderItem,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeType, SizesType, useTheme } from 'rn-vs-lb/theme';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';

import { useSafeAreaColors } from '../../store/SafeAreaColorProvider';
import astrologyService from '../../services/astrology/AstrologyService';
import type { HoroscopeCategory } from '../../types/astrology';
import {
  getStoredHoroscopesForToday,
  getStoredHoroscopeForToday,
  saveHoroscopeForToday,
  type StoredHoroscopes,
} from '../../helpers/astrology/horoscopeStorage';
import { getProfileInfo, type ProfileInfoData } from '../../helpers/profile/profileInfoStorage';
import { ROUTES, type DashboardScreenProps } from '../../navigation/types';
import { HoroscopeDescription } from './components/HoroscopeDescription';
import { HoroscopeCard } from './components/HoroscopeCard';
import { HoroscopeCardsCarousel, useHoroscopeCards } from './components/HoroscopeCardsCarousel';
import { HoroscopeModal } from './components/HoroscopeModal';
import { DashboardHeader } from './components/DashboardHeader';
import { HoroscopeTabBar } from './components/HoroscopeTabBar';
import { ProfileCompletionBanner } from './components/ProfileCompletionBanner';
import { useRootStore, useStoreData } from '../../store/StoreProvider';
import { getTokenBalance, subtractTokens } from '../../helpers/tokenStorage';
import { usePushNotifications } from '../../helpers/hooks';
import { consumeNotificationPromptPending } from '../../helpers/notifications/notificationPromptStorage';

type HoroscopeCardCategory = Exclude<HoroscopeCategory, 'general'>;

type HoroscopeCardData = {
  key: HoroscopeCardCategory;
  title: string;
  description?: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  accent: string;
};

export const CARD_WIDTH = 280;

const PROFILE_COMPLETION_THRESHOLD = 0.6;
const PROFILE_BANNER_DISMISSED_STORAGE_KEY = 'profileCompletionBannerDismissed';
const CARD_UNLOCK_COST = 5;

const calculateProfileCompletion = (profileInfo: ProfileInfoData): number => {
  const values = Object.values(profileInfo);
  const totalFields = values.length;

  if (totalFields === 0) {
    return 0;
  }

  const filledFields = values.filter((value) => `${value ?? ''}`.trim().length > 0).length;

  return Math.min(1, filledFields / totalFields);
};


export const DashboardScreen = () => {
  const { theme, sizes, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { setColors } = useSafeAreaColors();
  const { uiStore, configStore, authStore } = useRootStore();
  const navigation = useNavigation<DashboardScreenProps['navigation']>();
  const cards = useHoroscopeCards();
  const adsEnabled = useStoreData(configStore, (store) => store.adsEnabled);
  const [activeTab, setActiveTab] = useState(1);
  const [horoscopes, setHoroscopes] = useState<StoredHoroscopes>({});
  const [loadingByCategory, setLoadingByCategory] = useState<
    Partial<Record<HoroscopeCategory, boolean>>
  >({});
  const [errorsByCategory, setErrorsByCategory] = useState<
    Partial<Record<HoroscopeCategory, string>>
  >({});
  const [activeModalCategory, setActiveModalCategory] = useState<
    HoroscopeCardCategory | null
  >(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [shouldShowProfileBanner, setShouldShowProfileBanner] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [shouldPromptNotifications, setShouldPromptNotifications] = useState(false);
  const [isRequestingNotifications, setIsRequestingNotifications] = useState(false);
  const isMountedRef = useRef(true);
  const horoscopesRef = useRef<StoredHoroscopes>({});
  const { registerForPushNotificationsAsync } = usePushNotifications({ autoRegister: false });

  const handleOpenFilters = useCallback(() => {
    console.log('filters');
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    horoscopesRef.current = horoscopes;
  }, [horoscopes]);

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.background,
    });
  }, [setColors, theme.background]);

  useEffect(() => {
    let cancelled = false;

    const maybeShowNotificationPrompt = async () => {
      const shouldShow = await consumeNotificationPromptPending();

      if (!shouldShow || cancelled) {
        return;
      }

      try {
        const { status } = await Notifications.getPermissionsAsync();

        if (!cancelled && status !== 'granted') {
          setShouldPromptNotifications(true);
        }
      } catch (error) {
        console.warn('Failed to check notification permissions after onboarding', error);
      }
    };

    void maybeShowNotificationPrompt();

    return () => {
      cancelled = true;
    };
  }, []);

  const evaluateProfileCompletion = useCallback(async () => {
    try {
      const [profileInfo, dismissedValue] = await Promise.all([
        getProfileInfo(),
        AsyncStorage.getItem(PROFILE_BANNER_DISMISSED_STORAGE_KEY),
      ]);

      if (!isMountedRef.current) {
        return;
      }

      const completionRatio = calculateProfileCompletion(profileInfo);
      const isDismissed = dismissedValue === 'true';

      setProfileCompletion(completionRatio);
      setShouldShowProfileBanner(!isDismissed && completionRatio < PROFILE_COMPLETION_THRESHOLD);
    } catch (error) {
      console.warn('Failed to evaluate profile completion state', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void evaluateProfileCompletion();

      return () => {};
    }, [evaluateProfileCompletion]),
  );

  useEffect(() => {
    let cancelled = false;

    const loadStoredHoroscopes = async () => {
      try {
        const stored = await getStoredHoroscopesForToday();

        if (!cancelled && isMountedRef.current && Object.keys(stored).length) {
          setHoroscopes(stored);
        }
      } catch (error) {
        console.warn('Failed to preload horoscopes', error);
      }
    };

    loadStoredHoroscopes();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!adsEnabled) {
      setTokenBalance(null);
      return;
    }

    const loadBalance = async () => {
      try {
        const balance = await getTokenBalance();
        setTokenBalance(balance);
      } catch (error) {
        console.warn('Failed to load token balance', error);
        uiStore.showSnackbar('Не удалось получить баланс токенов.', 'error');
      }
    };

    void loadBalance();
  }, [adsEnabled, uiStore]);

  const loadHoroscope = useCallback(
    async (category: HoroscopeCategory, { force = false }: { force?: boolean } = {}) => {
      try {
        if (!force) {
          const existing = horoscopesRef.current?.[category];

          if (existing) {
            if (isMountedRef.current) {
              setErrorsByCategory((prev) => ({ ...prev, [category]: undefined }));
              setLoadingByCategory((prev) => ({ ...prev, [category]: false }));
            }

            return existing;
          }

          const cached = await getStoredHoroscopeForToday(category);

          if (cached) {
            if (isMountedRef.current) {
              setHoroscopes((prev) => ({ ...prev, [category]: cached }));
              setErrorsByCategory((prev) => ({ ...prev, [category]: undefined }));
              setLoadingByCategory((prev) => ({ ...prev, [category]: false }));
            }

            return cached;
          }
        }
      } catch (error) {
        console.warn('Failed to get cached horoscope', error);
      }

      if (!isMountedRef.current) {
        return null;
      }

      setLoadingByCategory((prev) => ({ ...prev, [category]: true }));
      setErrorsByCategory((prev) => ({ ...prev, [category]: undefined }));

      try {
        const profileInfo = await getProfileInfo();
        const response = await astrologyService.generateHoroscope(
          category,
          profileInfo,
          i18n.language,
        );
        const normalizedHoroscope =
          typeof response.horoscope === 'string' ? response.horoscope.trim() : '';

        const updatedHoroscopes = await saveHoroscopeForToday(
          category,
          normalizedHoroscope,
        );

        if (isMountedRef.current) {
          setHoroscopes(updatedHoroscopes);
          setErrorsByCategory((prev) => ({ ...prev, [category]: undefined }));
        }

        return normalizedHoroscope;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('screens.dashboard.horoscope.fetchError');

        if (isMountedRef.current) {
          setErrorsByCategory((prev) => ({ ...prev, [category]: message }));
        }

        throw error;
      } finally {
        if (isMountedRef.current) {
          setLoadingByCategory((prev) => ({ ...prev, [category]: false }));
        }
      }
    },
    [i18n.language, t],
  );

  useEffect(() => {
    loadHoroscope('general').catch((error) => {
      console.warn('Failed to load general horoscope', error);
    });
  }, [loadHoroscope]);

  const styles = useMemo(
    () => createStyles({ theme, sizes, topInset: insets.top }),
    [theme, sizes, insets.top],
  );

  const handleTabPress = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  const handleCardPress = useCallback(
    async (category: HoroscopeCardCategory) => {
      if (!adsEnabled) {
        setActiveModalCategory(category);
        return;
      }

      try {
        const balance = await getTokenBalance();
        setTokenBalance(balance);

        if (balance < CARD_UNLOCK_COST) {
          uiStore.showSnackbar('Недостаточно токенов для открытия карточки.', 'warning');
          return;
        }

        const updatedBalance = await subtractTokens(CARD_UNLOCK_COST);
        setTokenBalance(updatedBalance);
        setActiveModalCategory(category);
      } catch (error) {
        console.warn('Failed to spend tokens for card', error);
        uiStore.showSnackbar('Не удалось списать токены. Попробуйте позже.', 'error');
      }
    },
    [adsEnabled, uiStore],
  );

  const handleBannerPress = useCallback(() => {
    navigation.navigate(ROUTES.ProfileTab, {
      screen: ROUTES.ProfleSettings,
    });
  }, [navigation]);

  const handleBannerDismiss = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    setShouldShowProfileBanner(false);

    AsyncStorage.setItem(PROFILE_BANNER_DISMISSED_STORAGE_KEY, 'true').catch((error) => {
      console.warn('Failed to persist profile banner dismissal', error);
    });
  }, []);

  useEffect(() => {
    if (!activeModalCategory) {
      return;
    }

    loadHoroscope(activeModalCategory).catch((error) => {
      console.warn(`Failed to load ${activeModalCategory} horoscope`, error);
    });
  }, [activeModalCategory, loadHoroscope]);

  const handleEnableNotifications = useCallback(async () => {
    if (isRequestingNotifications) {
      return;
    }

    setIsRequestingNotifications(true);

    try {
      const { token, status, canAskAgain } = await registerForPushNotificationsAsync();

      if (!token) {
        if (status !== 'granted' && !canAskAgain) {
          await Linking.openSettings();
        }
        return;
      }

      if (status === 'granted') {
        await authStore.sendPushToken(token);

        if (isMountedRef.current) {
          setShouldPromptNotifications(false);
        }
      }
    } catch (error) {
      console.warn('Failed to enable notifications from dashboard prompt', error);
    } finally {
      if (isMountedRef.current) {
        setIsRequestingNotifications(false);
      }
    }
  }, [authStore, isRequestingNotifications, registerForPushNotificationsAsync]);

  const handleSkipNotifications = useCallback(() => {
    if (isMountedRef.current) {
      setShouldPromptNotifications(false);
    }
  }, []);

  const renderCard: ListRenderItem<HoroscopeCardData> = useCallback(
    ({ item }) => (
      <HoroscopeCard
        item={item}
        content={horoscopes[item.key]}
        isLoading={Boolean(loadingByCategory[item.key])}
        isUnlocked={Boolean(horoscopes[item.key])}
        adsEnabled={adsEnabled}
        unlockCost={CARD_UNLOCK_COST}
        onPress={() => handleCardPress(item.key)}
      />
    ),
    [adsEnabled, handleCardPress, horoscopes, loadingByCategory],
  );

  const closeModal = useCallback(() => {
    setActiveModalCategory(null);
  }, []);

  const retryModalRequest = useCallback(() => {
    if (!activeModalCategory) {
      return;
    }

    loadHoroscope(activeModalCategory, { force: true }).catch((error) => {
      console.warn(`Failed to reload ${activeModalCategory} horoscope`, error);
    });
  }, [activeModalCategory, loadHoroscope]);

  const modalCard = useMemo(
    () => cards.find((card) => card.key === activeModalCategory) ?? null,
    [activeModalCategory, cards],
  );

  const modalHoroscope = activeModalCategory
    ? horoscopes[activeModalCategory]
    : undefined;

  const modalLoading = activeModalCategory
    ? Boolean(loadingByCategory[activeModalCategory])
    : false;

  const modalError = activeModalCategory
    ? errorsByCategory[activeModalCategory]
    : undefined;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DashboardHeader
          onPressFilters={handleOpenFilters}
          adsEnabled={adsEnabled}
          tokenBalance={tokenBalance}
          onBalanceChange={setTokenBalance}
        />
        {shouldShowProfileBanner ? (
          <ProfileCompletionBanner
            completion={profileCompletion}
            onPress={handleBannerPress}
            onClose={handleBannerDismiss}
          />
        ) : null}
        {/* <HoroscopeTabBar activeIndex={activeTab} onChange={handleTabPress} /> */}
        <HoroscopeDescription
          horoscope={horoscopes.general}
          isLoading={Boolean(loadingByCategory.general)}
          errorMessage={errorsByCategory.general}
          onRetry={() =>
            loadHoroscope('general', { force: true }).catch((error) => {
              console.warn('Failed to reload general horoscope', error);
            })
          }
        />
        <HoroscopeCardsCarousel
          cards={cards}
          renderItem={renderCard}
          extraData={{
            horoscopes,
            loadingByCategory,
            adsEnabled,
          }}
        />
      </ScrollView>

      <HoroscopeModal
        visible={Boolean(activeModalCategory)}
        onClose={closeModal}
        title={modalCard?.title ?? ''}
        accent={modalCard?.accent ?? theme.card}
        horoscope={modalHoroscope}
        isLoading={modalLoading}
        errorMessage={modalError}
        onRetry={retryModalRequest}
      />

      <Modal
        transparent
        visible={shouldPromptNotifications}
        animationType="fade"
        onRequestClose={handleSkipNotifications}
      >
        <View style={styles.notificationPromptOverlay}>
          <View style={[styles.notificationPromptCard, { backgroundColor: theme.card }]}>
            <Text style={[typography.titleH4, styles.notificationPromptTitle]}>
              {t('screens.dashboard.notificationsPrompt.title')}
            </Text>
            <Text style={[typography.body, styles.notificationPromptDescription, { color: theme.greyText }]}>
              {t('screens.dashboard.notificationsPrompt.description')}
            </Text>

            <View style={styles.notificationPromptActions}>
              <TouchableOpacity
                onPress={handleSkipNotifications}
                style={styles.notificationPromptSecondaryButton}
                accessibilityRole="button"
              >
                <Text style={[typography.body, styles.notificationPromptSecondaryText]}>
                  {t('screens.dashboard.notificationsPrompt.actions.later')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEnableNotifications}
                disabled={isRequestingNotifications}
                style={[
                  styles.notificationPromptPrimaryButton,
                  isRequestingNotifications && styles.notificationPromptPrimaryButtonDisabled,
                ]}
                accessibilityRole="button"
              >
                <Text style={[typography.body, styles.notificationPromptPrimaryText]}>
                  {t('screens.dashboard.notificationsPrompt.actions.allow')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

type CreateStylesParams = {
  theme: ThemeType;
  sizes: SizesType;
  topInset: number;
};

const createStyles = ({ theme, sizes, topInset }: CreateStylesParams) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      gap: sizes.lg as number,
      paddingTop: 0,
      paddingBottom: sizes.xl as number,
      paddingHorizontal: sizes.xxs as number,
    },
    notificationPromptOverlay: {
      flex: 1,
      backgroundColor: '#00000080',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: sizes.lg as number,
    },
    notificationPromptCard: {
      width: '100%',
      borderRadius: sizes.lg as number,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      padding: sizes.lg as number,
      gap: sizes.md as number,
    },
    notificationPromptTitle: {
      color: theme.text,
    },
    notificationPromptDescription: {
      color: theme.text,
    },
    notificationPromptActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: sizes.sm as number,
    },
    notificationPromptPrimaryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: sizes.lg as number,
      paddingVertical: sizes.sm as number,
      borderRadius: sizes.md as number,
    },
    notificationPromptPrimaryButtonDisabled: {
      opacity: 0.7,
    },
    notificationPromptPrimaryText: {
      color: theme.background,
      fontWeight: '600',
    },
    notificationPromptSecondaryButton: {
      paddingHorizontal: sizes.md as number,
      paddingVertical: sizes.sm as number,
    },
    notificationPromptSecondaryText: {
      color: theme.text,
      fontWeight: '600',
    },
  });


export default DashboardScreen;
