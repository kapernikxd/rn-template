import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { ProfileSelfiesGalleryView } from "rn-vs-lb";
import { type SizesType, type ThemeType, type TypographytType, useTheme } from "rn-vs-lb/theme";

const WINDOW_WIDTH = Dimensions.get('window').width;

const MOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
];

export const LibraryScreen = () => {
  const { theme, sizes, typography } = useTheme();
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const styles = useMemo(
    () => createStyles({ theme, sizes, typography }),
    [theme, sizes, typography],
  );

  const columns = 2;
  const gap = 6;

  const itemSize = useMemo(() => {
    const decoratorPadding = 6; // paddingHorizontal from decorator View (16 * 2)
    const wrapperPadding = 6; // padding from component wrapper (20 * 2)

    return Math.floor((WINDOW_WIDTH - decoratorPadding - wrapperPadding - gap * (columns - 1)) / columns);
  }, []);

  const handleOpenAt = useCallback((index: number) => {
    setInitialIndex(index);
    setIsGalleryVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsGalleryVisible(false);
  }, []);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Text style={[typography.titleH4, {paddingHorizontal: 12, paddingVertical: 12}]}>Галерея</Text>
      <View style={styles.galleryWrapper}>
        <ProfileSelfiesGalleryView
          style={{padding: 0}}
          photos={MOCK_PHOTOS}
          columns={columns}
          itemSize={itemSize}
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
  });

export default LibraryScreen;
