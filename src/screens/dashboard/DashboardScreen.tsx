import React, { useCallback, useEffect, useMemo } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SIZES, useTheme } from "rn-vs-lb/theme";
import { useTranslation } from "react-i18next";

import { HorizontalCardSection, Spacer } from "rn-vs-lb";
import { useSafeAreaColors } from "../../store/SafeAreaColorProvider";
import { ROUTES, type DashboardNav } from "../../navigation/types";
import type { DashboardExperience } from "../../types/dashboard";
import { POPULAR_HOMELESS, POPULAR_NEIGHBOR, POPULAR_PLUMBER, SITUATION_2, SITUATION_GOVNO, TRAVEL_GIZA, TRAVEL_LONDON, TRAVEL_PARIS } from "../../helpers/utils/cards";


type LocalizedDashboardExperience = Omit<
  DashboardExperience,
  "title" | "description" | "generationPrompt" | "titleKey" | "descriptionKey" | "generationPromptKey"
> & {
  titleKey: string;
  descriptionKey: string;
  generationPromptKey: string;
};

type DashboardExperienceSection = {
  titleKey: string;
  cards: LocalizedDashboardExperience[];
};

const POPULAR_CARDS: LocalizedDashboardExperience[] = [
  {
    id: "popular-1",
    titleKey: "screens.dashboard.experience.cards.popular.prankGuest.title",
    image: {
      uri: POPULAR_HOMELESS,
    },
    descriptionKey: "screens.dashboard.experience.cards.popular.prankGuest.description",
    tokenCost: 10,
    case: "homeless",
    generationPromptKey: "screens.dashboard.experience.cards.popular.prankGuest.prompt",
  },
  {
    id: "popular-2",
    titleKey: "screens.dashboard.experience.cards.popular.plumber.title",
    image: {
      uri: POPULAR_PLUMBER,
    },
    descriptionKey: "screens.dashboard.experience.cards.popular.plumber.description",
    tokenCost: 10,
    case: "plumber",
    generationPromptKey: "screens.dashboard.experience.cards.popular.plumber.prompt",
  },
  {
    id: "popular-3",
    titleKey: "screens.dashboard.experience.cards.popular.neighbor.title",
    image: {
      uri: POPULAR_NEIGHBOR,
    },
    descriptionKey: "screens.dashboard.experience.cards.popular.neighbor.description",
    tokenCost: 10,
    case: "neighbor",
    generationPromptKey: "screens.dashboard.experience.cards.popular.neighbor.prompt",
  },
];

const TRAVEL_CARDS: LocalizedDashboardExperience[] = [
  {
    id: "horror-1",
    titleKey: "screens.dashboard.experience.cards.travel.paris.title",
    image: {
      uri: TRAVEL_PARIS,
    },
    descriptionKey: "screens.dashboard.experience.cards.travel.paris.description",
    tokenCost: 10,
    case: "paris",
    generationPromptKey: "screens.dashboard.experience.cards.travel.paris.prompt",
  },
  {
    id: "horror-2",
    titleKey: "screens.dashboard.experience.cards.travel.london.title",
    image: {
      uri: TRAVEL_LONDON,
    },
    descriptionKey: "screens.dashboard.experience.cards.travel.london.description",
    tokenCost: 10,
    case: "london",
    generationPromptKey: "screens.dashboard.experience.cards.travel.london.prompt",
  },
  {
    id: "horror-3",
    titleKey: "screens.dashboard.experience.cards.travel.giza.title",
    image: {
      uri: TRAVEL_GIZA,
    },
    descriptionKey: "screens.dashboard.experience.cards.travel.giza.description",
    tokenCost: 10,
    case: "giza",
    generationPromptKey: "screens.dashboard.experience.cards.travel.giza.prompt",
  },
];

const SITUATION_CARDS: LocalizedDashboardExperience[] = [
  {
    id: "costume-1",
    titleKey: "screens.dashboard.experience.cards.situations.flooded.title",
    image: {
      uri: SITUATION_GOVNO,
    },
    descriptionKey: "screens.dashboard.experience.cards.situations.flooded.description",
    tokenCost: 6,
    case: "flooded",
    generationPromptKey: "screens.dashboard.experience.cards.situations.flooded.prompt",
  },
  {
    id: "costume-2",
    titleKey: "screens.dashboard.experience.cards.situations.unexpectedGuests.title",
    image: {
      uri: SITUATION_2,
    },
    descriptionKey: "screens.dashboard.experience.cards.situations.unexpectedGuests.description",
    tokenCost: 10,
    case: "beggars",
    generationPromptKey: "screens.dashboard.experience.cards.situations.unexpectedGuests.prompt",
  },
];

const chatBackground = require("../../assets/ai-background.jpg");

export const DashboardScreen = () => {
  const { typography, sizes, theme } = useTheme();
  const { setColors } = useSafeAreaColors();
  const navigation = useNavigation<DashboardNav>();
  const { t } = useTranslation();

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.background,
    });
  }, [setColors, theme.background]);

  const sections = useMemo<DashboardExperienceSection[]>(
    () => [
      { titleKey: "screens.dashboard.experience.sections.popular", cards: POPULAR_CARDS },
      { titleKey: "screens.dashboard.experience.sections.travel", cards: TRAVEL_CARDS },
      { titleKey: "screens.dashboard.experience.sections.situations", cards: SITUATION_CARDS },
    ],
    [],
  );

  const translateCard = useCallback(
    (card: LocalizedDashboardExperience): DashboardExperience => ({
      ...card,
      title: t(card.titleKey),
      description: t(card.descriptionKey),
      generationPrompt: t(card.generationPromptKey),
      titleKey: card.titleKey,
      descriptionKey: card.descriptionKey,
      generationPromptKey: card.generationPromptKey,
    }),
    [t],
  );

  const handleCardPress = useCallback(
    (card: DashboardExperience) => {
      navigation.navigate(ROUTES.DashboardDetails, { card });
    },
    [navigation],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground source={chatBackground} style={styles.background}>
        <View style={[styles.header, { backgroundColor: theme.backgroundSemiTransparent }]}>
          <Text style={[typography.titleH3, { color: "white" }]}>{t("screens.dashboard.experience.hero.title")}</Text>
          <Text style={[typography.body, { color: "white" }]}>
            {t("screens.dashboard.experience.hero.subtitle")}
          </Text>
        </View>
      </ImageBackground>

      <Spacer size="lg" />

      <View style={styles.content}>
        {sections.map((section) => {
          const translatedCards = section.cards.map(translateCard);

          return (
            <React.Fragment key={section.titleKey}>
              <HorizontalCardSection
                key={section.titleKey}
                title={t(section.titleKey)}
                cards={translatedCards}
                // onPressSeeAll={() => handleSeeAll(section.title)}
                onPressCard={(card) => handleCardPress(card as DashboardExperience)}
                style={styles.section}
                contentContainerStyle={styles.sectionContent}
              />
              <Spacer size="md" />
              <Spacer size="lg" />
            </React.Fragment>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SIZES.xxs as number,
  },
  background: {
    paddingVertical: 90,
  },
  header: {
    gap: 12,
    paddingHorizontal: SIZES.lg as number,
  },
  section: {
    gap: 16,
  },
  sectionContent: {
    paddingHorizontal: 0,
  },
});

export default DashboardScreen;
