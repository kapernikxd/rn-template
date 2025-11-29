import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer, TabBarAi } from 'rn-vs-lb';
import { useTranslation } from 'react-i18next';

import { useRootStore, useStoreData } from '../../store/StoreProvider';
import type { AiBotMainPageBot } from '../../types';
import { AiBotCard } from '../../components/aibot/AiBotCard';
import { usePortalNavigation } from '../../helpers/hooks';
import { MAIN_HORIZONTAL_PADDING } from '../../constants/layout';
import { useSafeAreaColors } from '../../store/SafeAreaColorProvider';
import { capitalizeFirstLetter } from '../../helpers/utils/common';

const COLUMN_GAP = 2;

export const DashboardScreen = () => {
  const { aiBotStore } = useRootStore();
  const { setColors } = useSafeAreaColors();
  const bots = useStoreData(aiBotStore, (store) => store.mainPageBots);
  const isLoading = useStoreData(aiBotStore, (store) => store.isLoadingMainPageBots);
  const error = useStoreData(aiBotStore, (store) => store.mainPageBotsError);
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { goToAiBotProfile } = usePortalNavigation();
  const { t } = useTranslation();

  const [index, setIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.white,
    });
  }, [theme, setColors]);

  const normalizeCategory = useCallback((category: string) => category.trim().toLowerCase().replace(/\s+/g, '-'), []);

  const getCategoryLabel = useCallback(
    (categoryKey: string, fallback: string) => {
      const key = `screens.aibot.common.categories.${categoryKey}`;
      const translated = t(key);
      return translated === key ? capitalizeFirstLetter(fallback) : translated;
    },
    [t],
  );

  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, string>();

    bots.forEach((bot) => {
      bot.details?.categories?.forEach((category) => {
        const trimmedCategory = category?.trim();
        if (trimmedCategory) {
          const normalizedCategory = normalizeCategory(trimmedCategory);
          if (!uniqueCategories.has(normalizedCategory)) {
            uniqueCategories.set(normalizedCategory, trimmedCategory);
          }
        }
      });
    });

    return Array.from(uniqueCategories.entries()).map(([key, original]) => ({ key, original }));
  }, [bots, normalizeCategory]);

  const tabs = useMemo(
    () => [
      { key: 'all', label: t('screens.dashboard.tabs.all') },
      ...categories.map(({ key, original }) => ({
        key,
        label: getCategoryLabel(key, original),
      })),
    ],
    [categories, getCategoryLabel, t],
  );

  useEffect(() => {
    if (index >= tabs.length) {
      setIndex(0);
    }
  }, [index, tabs.length]);

  const activeTab = tabs[index] ?? tabs[0];

  const filteredBots = useMemo(() => {
    if (!activeTab || activeTab.key === 'all') {
      return bots;
    }

    return bots.filter((bot) =>
      bot.details?.categories?.some((category) =>
        category ? normalizeCategory(category) === activeTab.key : false,
      ),
    );
  }, [activeTab, bots, normalizeCategory]);

  useEffect(() => {
    if (!bots.length && !isLoading) {
      void aiBotStore.fetchMainPageBots();
    }
  }, [aiBotStore, bots.length, isLoading]);

  const cardWidth = useMemo(() => {
    return (width - MAIN_HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;
  }, [width]);

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.heading}>{t('screens.dashboard.heading')}</Text>
        <Text style={styles.subheading}>{t('screens.dashboard.subheading')}</Text>
      </View>
    ),
    [t],
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

  const handleRefresh = useCallback(async () => {
    if (isLoading || isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      await aiBotStore.fetchMainPageBots();
    } finally {
      setIsRefreshing(false);
    }
  }, [aiBotStore, isLoading, isRefreshing]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyState}>
      {isLoading ? (
        <ActivityIndicator color={theme.white} />
      ) : (
        <Text style={styles.emptyText}>{error ?? t('screens.dashboard.empty.default')}</Text>
      )}
    </View>
  ), [error, isLoading, t, theme.white]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TabBarAi
        tabs={tabs}
        activeIndex={index}
        onChange={setIndex}
        // кастомизация под твой тёмный UI
        activeColor={theme.black}
        inactiveColor={theme.black}
        indicatorColor={theme.black}
        indicatorHeight={2}
        fontSize={16}
        fontWeightActive="500"
        fontWeightInactive="300"
        gap={18}
      />
      <Spacer size='xs' />
      <FlatList
        data={filteredBots}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={[styles.content, bots.length === 0 && styles.emptyContent]}
        columnWrapperStyle={bots.length ? styles.columnWrapper : undefined}
        // ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.black}
            colors={[theme.black]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingTop: 16,
    gap: 2,
  },
  emptyContent: {
    flexGrow: 1,
  },
  columnWrapper: {
    gap: COLUMN_GAP,
    marginBottom: 2,
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
