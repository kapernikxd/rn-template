import React, { useCallback, useEffect, useMemo } from "react";
import { ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SIZES, useTheme } from "rn-vs-lb/theme";

import { HorizontalCardSection } from "rn-vs-lb";
import { Spacer } from "rn-vs-lb";
import { useSafeAreaColors } from "../../store/SafeAreaColorProvider";
import { ROUTES, type DashboardNav } from "../../navigation/types";
import type { DashboardExperience } from "../../types/dashboard";
import { Theme } from "../../constants";
import { POPULAR_HOMELESS, POPULAR_NEIGHBOR, POPULAR_PLUMBER, SITUATION_2, SITUATION_GOVNO, TRAVEL_GIZA, TRAVEL_LONDON, TRAVEL_PARIS } from "../../helpers/utils/cards";

const HALLOWEEN_BACKGROUND = "#070C1F";

const POPULAR_CARDS: DashboardExperience[] = [
  {
    id: "popular-1",
    title: "Розыгрыш с незваным гостем",
    image: {
      uri: POPULAR_HOMELESS,
    },
    description: "Разыграйте близких неожиданным гостем у себя дома!",
    tokenCost: 10,
  },
  {
    id: "popular-2",
    title: "Сантехник",
    image: {
      uri: POPULAR_PLUMBER,
    },
    description: "Разыграйте близких неожиданным гостем у себя дома!",
    tokenCost: 10,
  },
  {
    id: "popular-3",
    title: "Соседка",
    image: {
      uri: POPULAR_NEIGHBOR,
    },
    description: "Разыграйте близких неожиданным гостем у себя дома!",
    tokenCost: 10,
  },
];

const TRAVEL_CARDS: DashboardExperience[] = [
  {
    id: "horror-1",
    title: "Париж",
    image: {
      uri: TRAVEL_PARIS
    },
    description: "Поза с Эйфелевой башней в шикарном парижском стиле",
    tokenCost: 10,
  },
  {
    id: "horror-2",
    title: "Лондон",
    image: {
      uri: TRAVEL_LONDON
    },
    description: "Встаньте рядом с Биг-Беном в классическом лондонском стиле",
    tokenCost: 10,
  },
  {
    id: "horror-3",
    title: "Гиза",
    image: {
      uri: TRAVEL_GIZA
    },
    description: "Запечатлей свои первые восхищённые мгновения на фоне вечных пирамид.",
    tokenCost: 10,
  },
];

const SITUATION_CARDS: DashboardExperience[] = [
  {
    id: "costume-1",
    title: "Затопило",
    image: {
      uri: SITUATION_GOVNO,
    },
    description: "Разыграйте близких неожиданной ситуацией!",
    tokenCost: 6,
  },
  {
    id: "costume-2",
    title: 'Пришли цыгане',
    image: {
      uri: SITUATION_2,
    },
    description: "Разыграйте близких неожиданной ситуацией!",
    tokenCost: 10,
  },
];


const chatBackground = require('../../assets/ai-background.png');


export const DashboardScreen = () => {
  const { typography, sizes, theme } = useTheme();
  const { setColors } = useSafeAreaColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DashboardNav>();

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.background,
    });
  }, [setColors]);

  const sections = useMemo(
    () => [
      { title: "Популярное", cards: POPULAR_CARDS },
      { title: "Путешествия", cards: TRAVEL_CARDS },
      { title: "Ситуации", cards: SITUATION_CARDS },
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
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground source={chatBackground} style={styles.background}>
        <View style={[styles.header, { backgroundColor: theme.backgroundSemiTransparent }]}>
          <Text style={[typography.titleH3, {color: 'white'}]}>Halloween Night</Text>
          <Text style={[typography.body, {color: 'white'}]}>
            Grab some popcorn and stream the scariest scenes of the season.
          </Text>
        </View>
      </ImageBackground>

      <Spacer size="lg" />

      <View style={styles.content}>

        {sections.map((section) => (
          <>
            <HorizontalCardSection
              key={section.title}
              title={section.title}
              cards={section.cards}
              // onPressSeeAll={() => handleSeeAll(section.title)}
              onPressCard={(card) => handleCardPress(card as DashboardExperience)}
              style={styles.section}
              contentContainerStyle={styles.sectionContent}
            />
            <Spacer size="md" />
            <Spacer size="lg" />
          </>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SIZES.xxs as number
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
