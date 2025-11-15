import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  ListRenderItem,
  View,
} from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { CARD_WIDTH } from '../DashboardScreen';
import { HoroscopeCardData } from './HoroscopeCard';
import { useTranslation } from 'react-i18next';

type HoroscopeCardConfig = {
  key: HoroscopeCardData['key'];
  icon: HoroscopeCardData['icon'];
  accent: string;
  titleKey: string;
  descriptionKey?: string;
};

const CARD_CONFIG: HoroscopeCardConfig[] = [
  {
    key: 'career',
    icon: 'briefcase-variant-outline',
    accent: '#63B3FF',
    titleKey: 'screens.dashboard.horoscope.cards.career.title',
    descriptionKey: 'screens.dashboard.horoscope.cards.career.description',
  },
  {
    key: 'love',
    icon: 'heart-outline',
    accent: '#FF7AB8',
    titleKey: 'screens.dashboard.horoscope.cards.love.title',
    descriptionKey: 'screens.dashboard.horoscope.cards.love.description',
  },
  {
    key: 'health',
    icon: 'heart-pulse',
    accent: '#7DE2AC',
    titleKey: 'screens.dashboard.horoscope.cards.health.title',
    descriptionKey: 'screens.dashboard.horoscope.cards.health.description',
  },
  {
    key: 'family',
    icon: 'account-group-outline',
    accent: '#F7C977',
    titleKey: 'screens.dashboard.horoscope.cards.family.title',
    descriptionKey: 'screens.dashboard.horoscope.cards.family.description',
  },
];

export const useHoroscopeCards = (): HoroscopeCardData[] => {
  const { t } = useTranslation();

  return useMemo(
    () =>
      CARD_CONFIG.map((card) => ({
        key: card.key,
        icon: card.icon,
        accent: card.accent,
        title: t(card.titleKey),
        description: card.descriptionKey ? t(card.descriptionKey) : undefined,
      })),
    [t],
  );
};

type HoroscopeCardsCarouselProps = {
  cards: HoroscopeCardData[];
  renderItem: ListRenderItem<HoroscopeCardData>;
  extraData?: unknown;
};

export const HoroscopeCardsCarousel: React.FC<HoroscopeCardsCarouselProps> = ({ cards, renderItem, extraData }) => {
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
      data={cards}
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