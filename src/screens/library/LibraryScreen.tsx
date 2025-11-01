import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ProfileSelfiesGalleryView } from "rn-vs-lb";
import { type SizesType, type ThemeType, type TypographytType, useTheme } from "rn-vs-lb/theme";

const MOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
];

const MIN_ITEM_SIZE = 96;

export const LibraryScreen = () => {
  const { theme, sizes, typography } = useTheme();
  const { width } = useWindowDimensions();
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const styles = useMemo(
    () => createStyles({ theme, sizes, typography }),
    [theme, sizes, typography],
  );

  const columns = width < 380 ? 2 : 3;
  const gap = (sizes.sm as number) * 1.25;
  const horizontalPadding = (sizes.lg as number) * 2;
  const galleryItemSize = useMemo(() => {
    const availableWidth = width - horizontalPadding - gap * (columns - 1);
    return Math.max(MIN_ITEM_SIZE, availableWidth / columns);
  }, [columns, gap, horizontalPadding, width]);

  const handleOpenAt = useCallback((index: number) => {
    setInitialIndex(index);
    setIsGalleryVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsGalleryVisible(false);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Галерея селфи</Text>
      <View style={styles.galleryWrapper}>
        <ProfileSelfiesGalleryView
          photos={MOCK_PHOTOS}
          columns={columns}
          itemSize={galleryItemSize}
          gap={gap}
          visible={isGalleryVisible}
          initialIndex={initialIndex}
          onOpenAt={handleOpenAt}
          onClose={handleClose}
        />
      </View>
    </ScrollView>
  );
};

const createStyles = ({
  theme,
  sizes,
  typography,
}: {
  theme: ThemeType;
  sizes: SizesType;
  typography: TypographytType;
}) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: sizes.lg as number,
      paddingVertical: sizes.lg as number,
      backgroundColor: theme.background,
    },
    title: {
      ...typography.h3,
      marginBottom: sizes.lg as number,
      color: theme.black,
    },
    galleryWrapper: {
      flex: 1,
    },
  });

export default LibraryScreen;
