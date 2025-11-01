import React, { useCallback, useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "rn-vs-lb/theme";

import { HorizontalCardSection } from "rn-vs-lb";
import { Spacer } from "rn-vs-lb";
import { useSafeAreaColors } from "../../store/SafeAreaColorProvider";
import { ROUTES, type DashboardNav } from "../../navigation/types";
import type { DashboardExperience } from "../../types/dashboard";

const HALLOWEEN_BACKGROUND = "#070C1F";

const POPULAR_CARDS: DashboardExperience[] = [
  {
    id: "popular-1",
    title: "Homeless Prank",
    image: {
      uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
    },
    description: "Prank your loved ones with an unexpected guest in your home!",
    tokenCost: 10,
  },
  {
    id: "popular-2",
    title: "1940s",
    image: {
      uri: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    },
    description: "Travel back in time and recreate nostalgic family portraits in vintage style.",
    tokenCost: 12,
  },
  {
    id: "popular-3",
    title: "The Shining",
    image: {
      uri: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
    },
    description: "Step into an iconic horror scene and bring spine-chilling stories to life.",
    tokenCost: 9,
  },
];

const HORROR_SCENES_CARDS: DashboardExperience[] = [
  {
    id: "horror-1",
    title: "Spooky Y2K",
    image: {
      uri: "https://images.unsplash.com/photo-1506131864070-4d0baf2c0e4b?auto=format&fit=crop&w=600&q=80",
    },
    description: "Glitch your photos with neon chills straight from the Y2K vault.",
    tokenCost: 8,
  },
  {
    id: "horror-2",
    title: "Ghostface Movie Theater",
    image: {
      uri: "https://images.unsplash.com/photo-1504198070170-4ca53bb1c1fa?auto=format&fit=crop&w=600&q=80",
    },
    description: "Summon a masked stranger lurking in the aisles of a deserted cinema.",
    tokenCost: 11,
  },
  {
    id: "horror-3",
    title: "Chill",
    image: {
      uri: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80",
    },
    description: "Freeze your frame with a haunting touch of midnight frost.",
    tokenCost: 7,
  },
];

const HOT_COSTUMES_CARDS: DashboardExperience[] = [
  {
    id: "costume-1",
    title: "Midnight Witch",
    image: {
      uri: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80",
    },
    description: "Enchant your feed with a coven-ready look under the moonlight glow.",
    tokenCost: 6,
  },
  {
    id: "costume-2",
    title: "Neon Vampire",
    image: {
      uri: "https://images.unsplash.com/photo-1549570144-336da183aefd?auto=format&fit=crop&w=600&q=80",
    },
    description: "Blend cyberpunk vibes with bloodthirsty glam for a night out.",
    tokenCost: 10,
  },
  {
    id: "costume-3",
    title: "Pumpkin Squad",
    image: {
      uri: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=600&q=80",
    },
    description: "Turn your crew into the most charming patch of pumpkins in town.",
    tokenCost: 5,
  },
];

export const DashboardScreen = () => {
  const { typography, sizes } = useTheme();
  const { setColors } = useSafeAreaColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DashboardNav>();

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

  const handleCardPress = useCallback(
    (card: DashboardExperience) => {
      navigation.navigate(ROUTES.DashboardDetails, { card });
    },
    [navigation],
  );

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
          onPressCard={(card) => handleCardPress(card as DashboardExperience)}
          // isDark
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
