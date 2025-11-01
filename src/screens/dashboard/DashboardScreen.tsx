import React, { useCallback, useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "rn-vs-lb/theme";

import {
  HorizontalCardSection,
  type HorizontalCard,
} from "rn-vs-lb/components/Home/HorizontalCardSection";
import { Spacer } from "rn-vs-lb";
import { useSafeAreaColors } from "../../store/SafeAreaColorProvider";

const HALLOWEEN_BACKGROUND = "#070C1F";

const POPULAR_CARDS: HorizontalCard[] = [
  {
    id: "popular-1",
    title: "Homeless Prank",
    image: {
      uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: "popular-2",
    title: "1940s",
    image: {
      uri: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: "popular-3",
    title: "The Shining",
    image: {
      uri: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
    },
  },
];

const HORROR_SCENES_CARDS: HorizontalCard[] = [
  {
    id: "horror-1",
    title: "Spooky Y2K",
    image: {
      uri: "https://images.unsplash.com/photo-1506131864070-4d0baf2c0e4b?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: "horror-2",
    title: "Ghostface Movie Theater",
    image: {
      uri: "https://images.unsplash.com/photo-1504198070170-4ca53bb1c1fa?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: "horror-3",
    title: "Chill",
    image: {
      uri: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80",
    },
  },
];

const HOT_COSTUMES_CARDS: HorizontalCard[] = [
  {
    id: "costume-1",
    title: "Midnight Witch",
    image: {
      uri: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: "costume-2",
    title: "Neon Vampire",
    image: {
      uri: "https://images.unsplash.com/photo-1549570144-336da183aefd?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: "costume-3",
    title: "Pumpkin Squad",
    image: {
      uri: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=600&q=80",
    },
  },
];

export const DashboardScreen = () => {
  const { typography, sizes } = useTheme();
  const { setColors } = useSafeAreaColors();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setColors({
      topColor: HALLOWEEN_BACKGROUND,
      bottomColor: HALLOWEEN_BACKGROUND,
    });
  }, [setColors]);

  const sections = useMemo(
    () => [
      { title: "Popular", cards: POPULAR_CARDS },
      { title: "Horror Scenes", cards: HORROR_SCENES_CARDS },
      { title: "Hot Costumes", cards: HOT_COSTUMES_CARDS },
    ],
    [],
  );

  const handleSeeAll = useCallback((_sectionTitle: string) => {
    // TODO: integrate navigation to the full catalog
  }, []);

  const handleCardPress = useCallback((_card: HorizontalCard, _index: number) => {
    // TODO: integrate navigation to the detailed screen
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: HALLOWEEN_BACKGROUND }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: insets.bottom + sizes.xl,
          paddingTop: insets.top + sizes.lg,
          paddingHorizontal: sizes.lg,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[typography.titleH1, styles.heading]}>Halloween Night</Text>
        <Text style={[typography.bodyMd, styles.subheading]}>
          Grab some popcorn and stream the scariest scenes of the season.
        </Text>
      </View>

      <Spacer size="lg" />

      {sections.map((section) => (
        <HorizontalCardSection
          key={section.title}
          title={section.title}
          cards={section.cards}
          onPressSeeAll={() => handleSeeAll(section.title)}
          onPressCard={handleCardPress}
          isDark
          style={styles.section}
          contentContainerStyle={styles.sectionContent}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 28,
  },
  header: {
    gap: 12,
  },
  heading: {
    color: "#FFFFFF",
  },
  subheading: {
    color: "rgba(255, 255, 255, 0.72)",
  },
  section: {
    gap: 16,
  },
  sectionContent: {
    paddingHorizontal: 0,
  },
});

export default DashboardScreen;
