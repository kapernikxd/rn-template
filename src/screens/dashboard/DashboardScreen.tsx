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

const HALLOWEEN_BACKGROUND = "#070C1F";

const POPULAR_CARDS: DashboardExperience[] = [
  {
    id: "popular-1",
    title: "Розыгрыш с незваным гостем",
    image: {
      uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
    },
    description: "Разыграйте близких неожиданным гостем у себя дома!",
    tokenCost: 10,
  },
  {
    id: "popular-2",
    title: "1940-е",
    image: {
      uri: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    },
    description: "Отправьтесь назад во времени и воссоздайте семейные портреты в винтажном стиле.",
    tokenCost: 12,
  },
  {
    id: "popular-3",
    title: "Сияние",
    image: {
      uri: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
    },
    description: "Погрузитесь в культовую сцену ужаса и оживите леденящую историю.",
    tokenCost: 9,
  },
];

const HORROR_SCENES_CARDS: DashboardExperience[] = [
  {
    id: "horror-1",
    title: "Мистический Y2K",
    image: {
      uri: "https://images.unsplash.com/photo-1506131864070-4d0baf2c0e4b?auto=format&fit=crop&w=600&q=80",
    },
    description: "Добавьте фото неоновых глюков прямо из эпохи Y2K.",
    tokenCost: 8,
  },
  {
    id: "horror-2",
    title: "Кинотеатр с Призрачным лицом",
    image: {
      uri: "https://images.unsplash.com/photo-1504198070170-4ca53bb1c1fa?auto=format&fit=crop&w=600&q=80",
    },
    description: "Призовите маскированного незнакомца, скрывающегося в проходах пустого кинотеатра.",
    tokenCost: 11,
  },
  {
    id: "horror-3",
    title: "Ледяной холод",
    image: {
      uri: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80",
    },
    description: "Окутайте кадр зловещим полуночным инеем.",
    tokenCost: 7,
  },
];

const HOT_COSTUMES_CARDS: DashboardExperience[] = [
  {
    id: "costume-1",
    title: "Полночная ведьма",
    image: {
      uri: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80",
    },
    description: "Очаруйте ленту образом, готовым для шабаша в лунном сиянии.",
    tokenCost: 6,
  },
  {
    id: "costume-2",
    title: "Неоновый вампир",
    image: {
      uri: "https://images.unsplash.com/photo-1549570144-336da183aefd?auto=format&fit=crop&w=600&q=80",
    },
    description: "Соедините киберпанк и кровожадный гламур для яркой ночи.",
    tokenCost: 10,
  },
  {
    id: "costume-3",
    title: "Тыквенный отряд",
    image: {
      uri: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=600&q=80",
    },
    description: "Превратите свою компанию в самый обаятельный отряд тыкв в городе.",
    tokenCost: 5,
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
      { title: "Жуткие сцены", cards: HORROR_SCENES_CARDS },
      { title: "Образы для костюмов", cards: HOT_COSTUMES_CARDS },
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
