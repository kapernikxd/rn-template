import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { GalleryModal } from "rn-vs-lb/components";
import { useTheme } from "rn-vs-lb/theme";
import { useTranslation } from "react-i18next";

import { useRootStore, useStoreData } from "../../../store/StoreProvider";
import { getLocalUserId } from "../../../helpers/storageHelper";
import {
  addUnlockedPhotoForBot,
  getUnlockedPhotosForBot,
  setUnlockedPhotosForBot,
} from "../../../helpers/aiAgent/galleryUnlockStorage";
import { useRewardedAdTokens } from "../../../helpers/hooks/useRewardedAdTokens";

type AiAgentGalleryProps = {
  isLoading: boolean;
  photos: string[];
  galleryColumns: number;
  galleryItemSize: number;
  aiBotId?: string;
  adsEnabled: boolean;
  isCreator: boolean;
};

export const AiAgentGallery = memo(
  ({
    isLoading,
    photos,
    galleryColumns,
    galleryItemSize,
    aiBotId,
    adsEnabled,
    isCreator,
  }: AiAgentGalleryProps) => {
    const [visible, setVisible] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [viewerId, setViewerId] = useState<string | null>(null);
    const [unlockedPhotos, setUnlockedPhotos] = useState<string[]>([]);
    const [pendingUnlockIndex, setPendingUnlockIndex] = useState<number | null>(null);
    const { t } = useTranslation();
    const { theme, sizes, typography, isDark } = useTheme();
    const { authStore, uiStore } = useRootStore();
    const myId = useStoreData(authStore, (store) => store.myId);

    const shouldBlur = adsEnabled && !isCreator;

    useEffect(() => {
      let isMounted = true;

      const resolveViewerId = async () => {
        const id = myId ?? (await getLocalUserId());
        if (isMounted) {
          setViewerId(id);
        }
      };

      void resolveViewerId();

      return () => {
        isMounted = false;
      };
    }, [myId]);

    useEffect(() => {
      if (!shouldBlur) {
        setUnlockedPhotos(photos);
        return;
      }

      if (!viewerId || !aiBotId) {
        setUnlockedPhotos([]);
        return;
      }

      let isMounted = true;

      const loadUnlockedPhotos = async () => {
        const storedPhotos = await getUnlockedPhotosForBot(viewerId, aiBotId);
        const filteredPhotos = storedPhotos.filter((uri) => photos.includes(uri));

        if (storedPhotos.length !== filteredPhotos.length) {
          await setUnlockedPhotosForBot(viewerId, aiBotId, filteredPhotos);
        }

        if (isMounted) {
          setUnlockedPhotos(filteredPhotos);
        }
      };

      void loadUnlockedPhotos();

      return () => {
        isMounted = false;
      };
    }, [aiBotId, photos, shouldBlur, viewerId]);

    const unlockPhoto = useCallback(
      async (photoUri: string, indexToOpen?: number) => {
        setUnlockedPhotos((prev) => {
          if (prev.includes(photoUri)) {
            return prev;
          }
          return [...prev, photoUri];
        });

        if (viewerId && aiBotId) {
          await addUnlockedPhotoForBot(viewerId, aiBotId, photoUri);
        }

        if (typeof indexToOpen === "number") {
          setSelectedPhoto(photoUri);
          setVisible(true);
        }

        uiStore.showSnackbar(t("screens.aibot.gallery.locked.success"), "success");
      },
      [aiBotId, t, uiStore, viewerId],
    );

    const { showRewardedAd } = useRewardedAdTokens({
      onRewardEarned: () => {
        if (pendingUnlockIndex === null) return;
        const targetPhoto = photos[pendingUnlockIndex];
        setPendingUnlockIndex(null);
        if (!targetPhoto) return;
        void unlockPhoto(targetPhoto, pendingUnlockIndex);
      },
      shouldAwardTokens: false,
    });

    const onOpenAt = useCallback(
      (i: number) => {
        if (!shouldBlur || unlockedPhotos.includes(photos[i])) {
          setSelectedPhoto(photos[i]);
          setVisible(true);
          return;
        }

        setPendingUnlockIndex(i);
        showRewardedAd();
      },
      [photos, shouldBlur, showRewardedAd, unlockedPhotos],
    );

    const onClose = useCallback(() => {
      setVisible(false);
      setSelectedPhoto(null);
    }, []);

    const styles = useMemo(
      () => getStyles(theme, sizes, typography, isDark),
      [isDark, sizes, theme, typography],
    );

    if (isLoading) {
      return (
        <View style={styles.galleryWrapper}>
          <ActivityIndicator />
        </View>
      );
    }

    if (!photos.length) {
      return (
        <View style={styles.galleryWrapper}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t("screens.aibot.gallery.empty")}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.galleryWrapper}>
        <View style={styles.galleryGrid}>
          {photos.map((photo, i) => {
            const isLastInRow = (i + 1) % galleryColumns === 0;
            const isUnlocked = !shouldBlur || unlockedPhotos.includes(photo);

            return (
              <Pressable
                key={`${photo}-${i}`}
                onPress={() => onOpenAt(i)}
                android_ripple={{ color: "#00000022" }}
                style={[
                  styles.galleryImage,
                  isLastInRow && styles.galleryImageLast,
                  { width: galleryItemSize, height: galleryItemSize },
                ]}
              >
                <Image
                  source={{ uri: photo }}
                  blurRadius={isUnlocked ? 0 : 20}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: styles.galleryImage.borderRadius,
                  }}
                />
                {isUnlocked ? null : (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockTitle}>{t("screens.aibot.gallery.locked.title")}</Text>
                    <Text style={styles.lockCta}>{t("screens.aibot.gallery.locked.cta")}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <GalleryModal
          visible={visible}
          images={selectedPhoto ? [selectedPhoto] : []}
          initialIndex={0}
          onRequestClose={onClose}
        />
      </View>
    );
  }
);

const getStyles = (theme: any, sizes: any, typography: any, isDark: boolean) =>
  StyleSheet.create({
    galleryWrapper: {
      paddingHorizontal: sizes.md as number,
      paddingVertical: sizes.xl as number,
    },
    galleryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    galleryImage: {
      borderRadius: 18,
      backgroundColor: theme.backgroundSecond,
      marginRight: sizes.sm as number,
      marginBottom: sizes.sm as number,
      overflow: "hidden",
    },
    galleryImageLast: {
      marginRight: 0,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: sizes.lg as number,
    },
    emptyText: {
      ...(typography.bodySm as object),
      color: theme.greyText,
      textAlign: "center",
    },
    lockOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: sizes.sm as number,
      backgroundColor: isDark ? "#00000088" : "#00000055",
    },
    lockTitle: {
      ...(typography.bodyXs as object),
      color: theme.white,
      fontWeight: "700",
    },
    lockCta: {
      ...(typography.bodyXs as object),
      color: theme.white,
      textAlign: "center",
      marginTop: 4,
    },
  });

AiAgentGallery.displayName = "AiAgentGallery";
export default AiAgentGallery;
