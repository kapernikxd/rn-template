import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeType, SizesType, useTheme } from 'rn-vs-lb/theme';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

import { useSafeAreaColors } from '../../store/SafeAreaColorProvider';
import { TabBarAi as TabBar } from 'rn-vs-lb';
import astrologyService from '../../services/astrology/AstrologyService';
import type { HoroscopeCategory } from '../../types/astrology';
import {
  getStoredHoroscopesForToday,
  getStoredHoroscopeForToday,
  saveHoroscopeForToday,
  type StoredHoroscopes,
} from '../../helpers/astrology/horoscopeStorage';
import { getProfileInfo } from '../../helpers/profile/profileInfoStorage';

type HoroscopeCardCategory = Exclude<HoroscopeCategory, 'general'>;

type HoroscopeCardData = {
  key: HoroscopeCardCategory;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  accent: string;
};

type HoroscopeTab = {
  key: string;
  label: string;
};

const HOROSCOPE_CARDS: HoroscopeCardData[] = [
  {
    key: 'career',
    title: 'Карьера',
    description:
      'Луна во Льве помогает сфокусироваться на долгосрочных целях и заметить новые возможности роста.',
    icon: 'briefcase-variant-outline',
    accent: '#63B3FF',
  },
  {
    key: 'love',
    title: 'Любовь',
    description: 'В отношениях сегодня больше тепла. Откровенный разговор сделает связь сильнее.',
    icon: 'heart-outline',
    accent: '#FF7AB8',
  },
  {
    key: 'health',
    title: 'Здоровье',
    description:
      'Добавьте к привычному распорядку короткую разминку — организм отблагодарит энергией.',
    icon: 'heart-pulse',
    accent: '#7DE2AC',
  },
  {
    key: 'family',
    title: 'Семья',
    description:
      'Совместный вечер укрепит доверие. Запланируйте семейный ритуал, чтобы повторить его позже.',
    icon: 'account-group-outline',
    accent: '#F7C977',
  },
];

const tabs = [
  { key: 'yesterday', label: 'Вчера' },
  { key: 'today', label: 'Сегодня' },
  { key: 'tomorrow', label: 'Завтра' },
  { key: 'week', label: 'На неделю' },
  { key: 'month', label: 'На месяц' },
];

const CARD_WIDTH = 280;

const getTodayTitle = () => {
  const formatted = dayjs().locale('ru').format('dddd, D MMMM');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const splitHoroscopeIntoParagraphs = (value?: string) =>
  value
    ? value
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0)
    : [];

export const DashboardScreen = () => {
  const { theme, sizes } = useTheme();
  const insets = useSafeAreaInsets();
  const { setColors } = useSafeAreaColors();
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
        <HoroscopeTabBar activeIndex={activeTab} onChange={handleTabPress} />
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

type DashboardHeaderProps = {
  onPressFilters?: () => void;
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onPressFilters }) => {
  const { theme, typography, sizes } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: sizes.xs as number,
        },
        logo: {
          letterSpacing: 1,
          fontWeight: '700',
          fontSize: 24,
          color: theme.title,
        },
        button: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.card,
        },
        subtitle: {
          ...typography.bodySm,
          color: theme.greyText,
        },
        left: {
          gap: sizes.xs as number,
        },
      }),
    [theme, typography, sizes],
  );

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.logo}>AiAstrology</Text>
        <Text style={styles.subtitle}>Гороскоп на каждый день</Text>
      </View>
      <Pressable
        onPress={onPressFilters}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Открыть фильтры"
        hitSlop={8}
      >
        <Feather name="sliders" size={20} color={theme.title} />
      </Pressable>
    </View>
  );
};

type HoroscopeTabBarProps = {
  activeIndex: number;
  onChange: (index: number) => void;
};

const HoroscopeTabBar: React.FC<HoroscopeTabBarProps> = ({ activeIndex, onChange }) => {
  const { theme, typography, sizes } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: sizes.sm as number,
        },
        divider: {
          height: 1,
          backgroundColor: theme.border,
          marginTop: sizes.xs as number,
        },
      }),
    [theme, typography, sizes],
  );

  return (
    <View style={styles.container}>
        <TabBar
          tabs={tabs}
          activeIndex={activeIndex}
          onChange={onChange}
          activeColor={theme.title}
          inactiveColor={theme.text}
          indicatorColor="#F7C977"
          indicatorHeight={3}
          fontSize={16}
          fontWeightActive="700"
          fontWeightInactive="500"
          tabHorizontalPadding={0}
          gap={20}
        />
      <View style={styles.divider} />
    </View>
  );
};

type HoroscopeDescriptionProps = {
  horoscope?: string;
  isLoading?: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

const HoroscopeDescription: React.FC<HoroscopeDescriptionProps> = ({
  horoscope,
  isLoading = false,
  errorMessage,
  onRetry,
}) => {
  const { theme, typography, sizes } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.card,
          borderRadius: sizes.radius_lg as number,
          padding: sizes.lg as number,
          gap: sizes.sm as number,
        },
        title: {
          ...typography.titleH5,
        },
        text: {
          ...typography.body,
          lineHeight: 22,
        },
        loadingContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: sizes.xs as number,
        },
        messageContainer: {
          gap: sizes.xs as number,
        },
        helperText: {
          ...typography.body,
          color: theme.greyText,
        },
        errorText: {
          ...typography.body,
          color: theme.title,
          fontWeight: '600',
        },
        retryButton: {
          alignSelf: 'flex-start',
          paddingVertical: sizes.xs as number,
        },
        retryText: {
          ...typography.bodySm,
          color: theme.title,
          fontWeight: '600',
        },
      }),
    [theme, typography, sizes],
  );

  const todayTitle = useMemo(() => getTodayTitle(), []);
  const paragraphs = useMemo(() => splitHoroscopeIntoParagraphs(horoscope), [horoscope]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{todayTitle}</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.title} />
          <Text style={styles.helperText}>Готовим гороскоп...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>Не удалось загрузить гороскоп.</Text>
          <Text style={styles.helperText}>{errorMessage}</Text>
          <Pressable
            onPress={onRetry}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Попробовать снова получить гороскоп"
            hitSlop={8}
          >
            <Text style={styles.retryText}>Попробовать снова</Text>
          </Pressable>
        </View>
      ) : paragraphs.length > 0 ? (
        paragraphs.map((paragraph, index) => (
          <Text key={index} style={styles.text}>
            {paragraph}
          </Text>
        ))
      ) : (
        <Text style={styles.helperText}>
          Здесь появится ваш гороскоп, как только мы его получим.
        </Text>
      )}
    </View>
  );
};

type HoroscopeCardProps = {
  item: HoroscopeCardData;
  content?: string;
  isLoading: boolean;
  isUnlocked: boolean;
  onPress: () => void;
};

const HoroscopeCard: React.FC<HoroscopeCardProps> = ({
  item,
  content,
  isLoading,
  isUnlocked,
  onPress,
}) => {
  const { theme, typography, sizes } = useTheme();

  const previewText = useMemo(() => {
    const paragraphs = splitHoroscopeIntoParagraphs(content);

    if (paragraphs.length > 0) {
      return paragraphs[0];
    }

    return item.description;
  }, [content, item.description]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: CARD_WIDTH,
          minHeight: 156,
          backgroundColor: theme.card,
          borderRadius: sizes.radius_lg as number,
          padding: sizes.lg as number,
          justifyContent: 'space-between',
        },
        cardPressed: {
          opacity: 0.9,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
        iconWrapper: {
          backgroundColor: item.accent,
          borderRadius: sizes.radius as number,
          padding: sizes.sm as number,
        },
        headerRight: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        title: {
          ...typography.titleH6,
          marginTop: sizes.sm as number,
        },
        description: {
          ...typography.body,
          marginTop: sizes.xs as number,
        },
      }),
    [item.accent, sizes, theme.card, typography],
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Открыть гороскоп: ${item.title}`}
      hitSlop={8}
    >
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name={item.icon} size={24} color={theme.background} />
        </View>
        <View style={styles.headerRight}>
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.greyText} />
          ) : (
            <Feather name={isUnlocked ? 'unlock' : 'lock'} size={18} color={theme.greyText} />
          )}
        </View>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {previewText}
      </Text>
    </Pressable>
  );
};

type HoroscopeModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  accent: string;
  horoscope?: string;
  isLoading: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

const HoroscopeModal: React.FC<HoroscopeModalProps> = ({
  visible,
  onClose,
  title,
  accent,
  horoscope,
  isLoading,
  errorMessage,
  onRetry,
}) => {
  const { theme, typography, sizes } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          justifyContent: 'center',
          padding: sizes.lg as number,
        },
        content: {
          backgroundColor: theme.card,
          borderRadius: sizes.radius_lg as number,
          padding: sizes.lg as number,
          gap: sizes.sm as number,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        title: {
          ...typography.titleH5,
        },
        closeButton: {
          padding: sizes.xs as number,
        },
        accentLine: {
          height: 4,
          borderRadius: sizes.radius as number,
          backgroundColor: accent,
        },
        date: {
          ...typography.bodySm,
          color: theme.greyText,
        },
        body: {
          gap: sizes.xs as number,
        },
        paragraph: {
          ...typography.body,
          lineHeight: 22,
        },
        loadingContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: sizes.xs as number,
        },
        messageContainer: {
          gap: sizes.xs as number,
        },
        helperText: {
          ...typography.body,
          color: theme.greyText,
        },
        errorText: {
          ...typography.body,
          color: theme.title,
          fontWeight: '600',
        },
        retryButton: {
          alignSelf: 'flex-start',
          paddingVertical: sizes.xs as number,
        },
        retryText: {
          ...typography.bodySm,
          color: theme.title,
          fontWeight: '600',
        },
      }),
    [accent, sizes, theme.card, theme.greyText, theme.title, typography.body, typography.bodySm, typography.titleH5],
  );

  const paragraphs = useMemo(() => splitHoroscopeIntoParagraphs(horoscope), [horoscope]);
  const todayTitle = useMemo(() => getTodayTitle(), []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title || 'Гороскоп'}</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Закрыть гороскоп"
              hitSlop={8}
            >
              <Feather name="x" size={20} color={theme.title} />
            </Pressable>
          </View>
          <View style={[styles.accentLine, { backgroundColor: accent }]} />
          <Text style={styles.date}>{todayTitle}</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.title} />
              <Text style={styles.helperText}>Готовим гороскоп...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.messageContainer}>
              <Text style={styles.errorText}>Не удалось загрузить гороскоп.</Text>
              <Text style={styles.helperText}>{errorMessage}</Text>
              <Pressable
                onPress={onRetry}
                style={styles.retryButton}
                accessibilityRole="button"
                accessibilityLabel="Попробовать снова получить гороскоп"
                hitSlop={8}
              >
                <Text style={styles.retryText}>Попробовать снова</Text>
              </Pressable>
            </View>
          ) : paragraphs.length > 0 ? (
            <View style={styles.body}>
              {paragraphs.map((paragraph, index) => (
                <Text key={index} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.helperText}>
              Пока нет гороскопа для этой категории на сегодня.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

type HoroscopeCardsCarouselProps = {
  renderItem: ListRenderItem<HoroscopeCardData>;
  extraData?: unknown;
};

const HoroscopeCardsCarousel: React.FC<HoroscopeCardsCarouselProps> = ({ renderItem, extraData }) => {
  const { sizes } = useTheme();
  const gap = sizes.md as number;
  const horizontalPadding = sizes.xs as number;

  const itemSeparator = useCallback(() => <View style={{ width: gap }} />, [gap]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: CARD_WIDTH + gap,
      offset: (CARD_WIDTH + gap) * index + horizontalPadding,
      index,
    }),
    [gap, horizontalPadding],
  );

  return (
    <FlatList
      horizontal
      data={HOROSCOPE_CARDS}
      keyExtractor={(item) => item.key}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
      ItemSeparatorComponent={itemSeparator}
      renderItem={renderItem}
      extraData={extraData}
      getItemLayout={getItemLayout}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + gap}
    />
  );
};

export default DashboardScreen;
