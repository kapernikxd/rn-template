import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ProfileSelfiesGalleryView } from "rn-vs-lb";
import { type SizesType, type ThemeType, useTheme } from "rn-vs-lb/theme";
import { useFocusEffect } from "@react-navigation/native";

import { useRootStore, useStoreData } from "../../store/StoreProvider";

const WINDOW_WIDTH = Dimensions.get("window").width;

export const LibraryScreen = () => {
  const { theme, sizes, typography } = useTheme();
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const { imageGenerationStore } = useRootStore();

  const { photos, isLoading, isSyncing, pendingCount } = useStoreData(
    imageGenerationStore,
    (store) => ({
      photos: store.completedImageUrls,
      isLoading: store.isLoadingRequests,
      isSyncing: store.isSyncingRequests,
      pendingCount: store.pendingRequestCount,
    }),
  );

  useFocusEffect(
    useCallback(() => {
      void imageGenerationStore.reloadRequests();
    }, [imageGenerationStore]),
  );

  const styles = useMemo(
    () => createStyles({ theme, sizes }),
    [theme, sizes],
  );

  const columns = 2;
  const gap = 6;

  const itemSize = useMemo(() => {
    const decoratorPadding = 6; // paddingHorizontal from decorator View (16 * 2)
    const wrapperPadding = 6; // padding from component wrapper (20 * 2)

    return Math.floor(
      (WINDOW_WIDTH - decoratorPadding - wrapperPadding - gap * (columns - 1)) /
        columns,
    );
  }, []);

  const handleOpenAt = useCallback((index: number) => {
    setInitialIndex(index);
    setIsGalleryVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsGalleryVisible(false);
  }, []);

  const refreshing = isLoading || isSyncing;

  const handleRefresh = useCallback(() => {
    void imageGenerationStore.reloadRequests();
  }, [imageGenerationStore]);

  const handleSyncPending = useCallback(() => {
    void imageGenerationStore.refreshPendingRequests();
  }, [imageGenerationStore]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
        />
      }
    >
      <Text style={[typography.titleH4, { paddingHorizontal: 12, paddingVertical: 12 }]}>Галерея</Text>

      {pendingCount > 0 ? (
        <View style={styles.pendingWrapper}>
          <Text style={[typography.bodySm, styles.pendingText]}>
            Обрабатывается {pendingCount} {pendingCount === 1 ? "изображение" : "изображения"}...
          </Text>
          <Text onPress={handleSyncPending} style={[typography.bodySm, styles.syncLink]}>
            Обновить статус
          </Text>
        </View>
      ) : null}

      <View style={styles.galleryWrapper}>
        {photos.length ? (
          <ProfileSelfiesGalleryView
            style={{ padding: 0 }}
            photos={photos}
            columns={columns}
            itemSize={itemSize}
            gap={gap}
            visible={isGalleryVisible}
            initialIndex={initialIndex}
            onOpenAt={handleOpenAt}
            onClose={handleClose}
          />
        ) : (
          <View style={styles.emptyState}>
            {refreshing ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <Text style={[typography.body, styles.emptyStateText]}>
                Здесь появятся ваши готовые изображения после обработки.
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const createStyles = ({
  theme,
  sizes,
}: {
  theme: ThemeType;
  sizes: SizesType;
}) =>
  StyleSheet.create({
    scroll: {
      backgroundColor: theme.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: sizes.xxs as number,
      paddingVertical: sizes.xxs as number,
      backgroundColor: theme.background,
    },
    galleryWrapper: {
      flex: 1,
    },
    emptyState: {
      minHeight: 200,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: sizes.md as number,
    },
    emptyStateText: {
      textAlign: "center",
      color: "rgba(255,255,255,0.72)",
    },
    pendingWrapper: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: sizes.xs as number,
      paddingBottom: sizes.sm as number,
    },
    pendingText: {
      color: "rgba(255,255,255,0.72)",
    },
    syncLink: {
      color: theme.primary,
      fontWeight: "600",
    },
  });

export default LibraryScreen;
