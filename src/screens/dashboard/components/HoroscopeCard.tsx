import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'rn-vs-lb/theme';
import type { HoroscopeCategory } from '../../../types/astrology';
import { CARD_WIDTH } from '../DashboardScreen';
import { splitHoroscopeIntoParagraphs } from './HoroscopeDescription';

type HoroscopeCardCategory = Exclude<HoroscopeCategory, 'general'>;

export type HoroscopeCardData = {
  key: HoroscopeCardCategory;
  title: string;
  description?: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  accent: string;
};

type HoroscopeCardProps = {
  item: HoroscopeCardData;
  content?: string;
  isLoading: boolean;
  isUnlocked: boolean;
  onPress: () => void;
};

export const HoroscopeCard: React.FC<HoroscopeCardProps> = ({
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
          minHeight: 56,
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