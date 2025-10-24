import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { PlaceCardList } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';

import type { AiBotCardEntity } from './AiBotCard';
import { getAiBotDescription, getAiBotImageUri, getAiBotTitle } from '../../helpers/utils/aibot';
import { getAiBotIdentifier } from '../../helpers/utils/agent-create';

const DEFAULT_DESCRIPTION = 'Описание отсутствует';
const DEFAULT_IMAGE = 'https://via.placeholder.com/320x180.png?text=AI';

type AiBotPlaceCardListProps = {
  bots: AiBotCardEntity[];
  isLoading?: boolean;
  emptyText?: string;
  onBotPress?: (bot: AiBotCardEntity) => void;
};

export const AiBotPlaceCardList = ({
  bots,
  isLoading = false,
  emptyText = 'Здесь пока пусто. Возвращайтесь позже!',
  onBotPress,
}: AiBotPlaceCardListProps) => {
  const { theme, typography } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!bots.length) {
    return (
      <Text style={[typography.bodyXs, styles.emptyText, { color: theme.greyText }]}>{emptyText}</Text>
    );
  }

  return (
    <View style={styles.list}>
      {bots.map((bot, index) => {
        const key = getAiBotIdentifier(bot) || `${getAiBotTitle(bot)}-${index}`;
        const imageUri = getAiBotImageUri(bot) ?? DEFAULT_IMAGE;
        const title = getAiBotTitle(bot);
        const description = getAiBotDescription(bot) ?? DEFAULT_DESCRIPTION;

        return (
          <Pressable
            key={key}
            onPress={onBotPress ? () => onBotPress(bot) : undefined}
            disabled={!onBotPress}
            style={({ pressed }) => [styles.cardWrapper, pressed && styles.cardPressed]}
            android_ripple={{ color: theme.primary + '33' }}
            accessibilityRole={onBotPress ? 'button' : undefined}
            accessibilityLabel={title}
          >
            <PlaceCardList imageUri={imageUri} title={title} description={description} />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  loader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 12,
  },
  cardWrapper: {
    borderRadius: 16,
  },
  cardPressed: {
    opacity: 0.85,
  },
});
