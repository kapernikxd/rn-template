import { ActivityIndicator, FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useCallback, useEffect, useMemo } from 'react';
import { useTheme } from 'rn-vs-lb/theme';

import { useRootStore, useStoreData } from '../../../store/StoreProvider';
import type { AiBotMainPageBot } from '../../../types';
import { AiBotCard } from '../components/AiBotCard';
import { usePortalNavigation } from '../../../helpers/hooks';

const HORIZONTAL_PADDING = 24;
const COLUMN_GAP = 16;

export const DashboardScreen = () => {
  const { aiBotStore } = useRootStore();
  const bots = useStoreData(aiBotStore, (store) => store.mainPageBots);
  const isLoading = useStoreData(aiBotStore, (store) => store.isLoadingMainPageBots);
  const error = useStoreData(aiBotStore, (store) => store.mainPageBotsError);
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { goToAiBotProfile } = usePortalNavigation();

  useEffect(() => {
    if (!bots.length && !isLoading) {
      void aiBotStore.fetchMainPageBots();
    }
  }, [aiBotStore, bots.length, isLoading]);

  const cardWidth = useMemo(() => {
    return (width - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;
  }, [width]);

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.heading}>AI-компаньоны</Text>
        <Text style={styles.subheading}>
          Выберите бота, чтобы начать диалог или найти вдохновение. Команда ежедневно добавляет
          новых героев и сценарии общения.
        </Text>
      </View>
    ),
    [],
  );

  const handleOpenBotProfile = useCallback((botId: string) => {
    goToAiBotProfile(botId);
  }, [goToAiBotProfile]);

  const renderItem = useCallback(
    ({ item }: { item: AiBotMainPageBot }) => (
      <AiBotCard
        bot={item}
        style={{ width: cardWidth }}
        onPress={() => handleOpenBotProfile(item.id)}
      />
    ),
    [cardWidth, handleOpenBotProfile],
  );

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyState}>
      {isLoading ? (
        <ActivityIndicator color={theme.white} />
      ) : (
        <Text style={styles.emptyText}>
          {error ?? 'AI-боты скоро появятся здесь. Попробуйте обновить позже.'}
        </Text>
      )}
    </View>
  ), [error, isLoading, theme.white]);

  return (
    <View style={[styles.container, { backgroundColor: theme.darkBackground }]}>
      <FlatList
        data={bots}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={[styles.content, bots.length === 0 && styles.emptyContent]}
        columnWrapperStyle={bots.length ? styles.columnWrapper : undefined}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 20,
  },
  emptyContent: {
    flexGrow: 1,
  },
  columnWrapper: {
    gap: COLUMN_GAP,
    marginBottom: 18,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.72)',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.65)',
  },
});
