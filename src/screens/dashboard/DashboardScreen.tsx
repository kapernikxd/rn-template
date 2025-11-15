import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ListRenderItem,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeType, SizesType, useTheme } from 'rn-vs-lb/theme';

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
import { HOROSCOPE_CARDS, HoroscopeCardsCarousel } from './components/HoroscopeCardsCarousel';
import { HoroscopeModal } from './components/HoroscopeModal';
import { DashboardHeader } from './components/DashboardHeader';
import { HoroscopeTabBar } from './components/HoroscopeTabBar';
import { ProfileCompletionBanner } from './components/ProfileCompletionBanner';

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
  const { theme, sizes } = useTheme();
  const insets = useSafeAreaInsets();
  const { setColors } = useSafeAreaColors();
  const navigation = useNavigation<DashboardScreenProps['navigation']>();
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
  const isMountedRef = useRef(true);
  const horoscopesRef = useRef<StoredHoroscopes>({});

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
        const response = await astrologyService.generateHoroscope(category, profileInfo);
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
          error instanceof Error ? error.message : 'Не удалось получить гороскоп';

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
    [],
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

  const handleCardPress = useCallback((category: HoroscopeCardCategory) => {
    setActiveModalCategory(category);
  }, []);

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

  const renderCard: ListRenderItem<HoroscopeCardData> = useCallback(
    ({ item }) => (
      <HoroscopeCard
        item={item}
        content={horoscopes[item.key]}
        isLoading={Boolean(loadingByCategory[item.key])}
        isUnlocked={Boolean(horoscopes[item.key])}
        onPress={() => handleCardPress(item.key)}
      />
    ),
    [handleCardPress, horoscopes, loadingByCategory],
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
    () => HOROSCOPE_CARDS.find((card) => card.key === activeModalCategory) ?? null,
    [activeModalCategory],
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
        <DashboardHeader onPressFilters={handleOpenFilters} />
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
          renderItem={renderCard}
          extraData={{
            horoscopes,
            loadingByCategory,
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
      paddingBottom: (sizes.xl as number) * 2,
      paddingHorizontal: sizes.xxs as number,
    },
  });


export default DashboardScreen;
