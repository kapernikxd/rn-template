import React, { useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  View,
} from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { CARD_WIDTH } from '../DashboardScreen';
import { HoroscopeCardData } from './HoroscopeCard';


export const HOROSCOPE_CARDS: HoroscopeCardData[] = [
  {
    key: 'career',
    title: 'Карьера',
    icon: 'briefcase-variant-outline',
    accent: '#63B3FF',
  },
  {
    key: 'love',
    title: 'Любовь',
    icon: 'heart-outline',
    accent: '#FF7AB8',
  },
  {
    key: 'health',
    title: 'Здоровье',
    icon: 'heart-pulse',
    accent: '#7DE2AC',
  },
  {
    key: 'family',
    title: 'Семья',
    icon: 'account-group-outline',
    accent: '#F7C977',
  },
];

type HoroscopeCardsCarouselProps = {
  renderItem: ListRenderItem<HoroscopeCardData>;
  extraData?: unknown;
};

export const HoroscopeCardsCarousel: React.FC<HoroscopeCardsCarouselProps> = ({ renderItem, extraData }) => {
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