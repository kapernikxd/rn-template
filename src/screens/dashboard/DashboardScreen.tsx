import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeType, SizesType, useTheme } from 'rn-vs-lb/theme';

import { useSafeAreaColors } from '../../store/SafeAreaColorProvider';

type HoroscopeCardData = {
  key: string;
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

const HOROSCOPE_TABS: HoroscopeTab[] = [
  { key: 'yesterday', label: 'Вчера' },
  { key: 'today', label: 'Сегодня' },
  { key: 'tomorrow', label: 'Завтра' },
  { key: 'week', label: 'На неделю' },
  { key: 'month', label: 'На месяц' },
];

const CARD_WIDTH = 280;

export const DashboardScreen = () => {
  const { theme, sizes } = useTheme();
  const insets = useSafeAreaInsets();
  const { setColors } = useSafeAreaColors();
  const [activeTab, setActiveTab] = useState(1);

  const handleOpenFilters = useCallback(() => {
    console.log('filters');
  }, []);

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.background,
    });
  }, [setColors, theme.background]);

  const styles = useMemo(
    () => createStyles({ theme, sizes, topInset: insets.top }),
    [theme, sizes, insets.top],
  );

  const handleTabPress = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  const renderCard: ListRenderItem<HoroscopeCardData> = useCallback(
    ({ item }) => <HoroscopeCard item={item} />,
    [],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DashboardHeader onPressFilters={handleOpenFilters} />
        <HoroscopeTabBar activeIndex={activeTab} onChange={handleTabPress} />
        <HoroscopeDescription />
        <HoroscopeCardsCarousel renderItem={renderCard} />
      </ScrollView>
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
      paddingTop: topInset + (sizes.xl as number),
      paddingBottom: (sizes.xl as number) * 2,
      paddingHorizontal: sizes.lg as number,
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
        <Text style={styles.logo}>CityLife</Text>
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
        tabs: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: sizes.md as number,
        },
        tab: {
          paddingVertical: sizes.xs as number,
          paddingHorizontal: sizes.sm as number,
          alignItems: 'center',
          justifyContent: 'center',
        },
        label: {
          ...typography.bodySm,
          color: theme.greyText,
        },
        labelActive: {
          color: theme.title,
          fontWeight: '700',
        },
        indicator: {
          marginTop: sizes.xs as number,
          height: 3,
          borderRadius: 2,
          alignSelf: 'stretch',
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {HOROSCOPE_TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(index)}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
              {isActive ? (
                <View style={[styles.indicator, { backgroundColor: '#F7C977', width: '100%' }]} />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.divider} />
    </View>
  );
};

const HoroscopeDescription: React.FC = () => {
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
      }),
    [theme, typography, sizes],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Понедельник, 10 ноября</Text>
      <Text style={styles.text}>
        Сегодня, Козерог, энергия Луны во Льве помогает смело заявить о себе. Используйте этот заряд, чтобы показать
        свои идеи и таланты, а также поддержать тех, кто рядом с вами.
      </Text>
      <Text style={styles.text}>
        День отлично подходит для проектов, что зажигают вас изнутри. Делитесь вдохновением и не бойтесь инициативы —
        это поможет получить заслуженное внимание.
      </Text>
    </View>
  );
};

type HoroscopeCardProps = {
  item: HoroscopeCardData;
};

const HoroscopeCard: React.FC<HoroscopeCardProps> = ({ item }) => {
  const { theme, typography, sizes } = useTheme();

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
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name={item.icon} size={24} color={theme.background} />
        </View>
        <Feather name="lock" size={18} color={theme.greyText} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>
    </View>
  );
};

type HoroscopeCardsCarouselProps = {
  renderItem: ListRenderItem<HoroscopeCardData>;
};

const HoroscopeCardsCarousel: React.FC<HoroscopeCardsCarouselProps> = ({ renderItem }) => {
  const { sizes } = useTheme();
  const gap = sizes.md as number;
  const horizontalPadding = sizes.xs as number;

  const itemSeparator = useCallback(() => <View style={{ width: gap }} />, []);

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
      getItemLayout={getItemLayout}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + gap}
    />
  );
};

export default DashboardScreen;
