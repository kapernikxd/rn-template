import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'rn-vs-lb/theme';

type NatalReadingCardProps = {
  title: string;
  accent: string;
  preview?: string;
  isSaved?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const splitIntoParagraphs = (value?: string) =>
  value
    ? value
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0)
    : [];

export const NatalReadingCard: React.FC<NatalReadingCardProps> = ({
  title,
  accent,
  preview,
  isSaved = false,
  isLoading = false,
  disabled = false,
  onPress,
}) => {
  const { theme, typography, sizes } = useTheme();

  const previewText = useMemo(() => {
    const paragraphs = splitIntoParagraphs(preview);
    return paragraphs[0];
  }, [preview]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.card,
          borderRadius: sizes.radius_lg as number,
          padding: sizes.lg as number,
          gap: sizes.sm as number,
          flex: 1,
          minHeight: 120,
          opacity: disabled ? 0.6 : 1,

          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 10,
          elevation: 2,
        },
        pressed: {
          transform: [{ scale: 0.98 }],
        },
        accentStrip: {
          height: 4,
          borderRadius: sizes.radius as number,
          backgroundColor: accent,
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: sizes.sm as number,
        },
        title: {
          ...typography.titleH6,
          flex: 1,
        },
        status: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: sizes.xs as number,
        },
        statusText: {
          ...typography.bodySm,
          color: theme.greyText,
        },
        description: {
          ...typography.body,
          color: theme.title,
        },
      }),
    [accent, disabled, sizes.lg, sizes.radius, sizes.radius_lg, sizes.sm, sizes.xs, theme.card, theme.greyText, theme.title, typography.body, typography.bodySm, typography.titleH6],
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.accentStrip} />

      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.status}>
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.greyText} />
          ) : isSaved ? (
            <Feather name="check-circle" size={18} color={accent} />
          ) : (
            <Feather name="arrow-right" size={18} color={theme.greyText} />
          )}
          <Text style={styles.statusText} numberOfLines={1}>
            {isLoading ? 'Запрос...' : isSaved ? 'Сохранено' : 'Открыть'}
          </Text>
        </View>
      </View>

      {previewText ? (
        <Text style={styles.description} numberOfLines={3}>
          {previewText}
        </Text>
      ) : null}
    </Pressable>
  );
};
