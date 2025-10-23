import { memo, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';

import { AiBotCard, type AiBotCardEntity, getAiBotIdentifier } from './AiBotCard';

type AiBotListSectionProps = {
  title: string;
  bots: AiBotCardEntity[];
  isLoading?: boolean;
  emptyText?: string;
  onBotPress?: (bot: AiBotCardEntity) => void;
};

const CARD_WIDTH = 220;

const AiBotListSectionComponent = ({
  title,
  bots,
  isLoading = false,
  emptyText = 'Здесь пока пусто. Возвращайтесь позже!',
  onBotPress,
}: AiBotListSectionProps) => {
  const { theme, isDark } = useTheme();

  const containerStyle = useMemo(
    () => ({
      backgroundColor: isDark ? theme.card : theme.white,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.28 : 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
      elevation: isDark ? 8 : 5,
    }),
    [isDark, theme.card, theme.white],
  );

  return (
    <View style={[styles.section, containerStyle]}>
      <Text style={[styles.title, { color: theme.title }]}>{title}</Text>
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : bots.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {bots.map((bot, index) => {
            const key = getAiBotIdentifier(bot) || `${bot.name}-${bot.lastname}-${index}`;
            return (
              <View key={key} style={styles.cardWrapper}>
                <AiBotCard bot={bot} style={styles.card} onPress={onBotPress ? () => onBotPress(bot) : undefined} />
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={[styles.emptyText, { color: theme.greyText }]}>{emptyText}</Text>
      )}
    </View>
  );
};

export const AiBotListSection = memo(AiBotListSectionComponent);

const styles = StyleSheet.create({
  section: {
    borderRadius: 28,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  listContent: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 4,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    width: '100%',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
