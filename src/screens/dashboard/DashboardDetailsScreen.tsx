import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "rn-vs-lb/theme";
import { Spacer } from "rn-vs-lb";

import { ExperiencePreviewHeader } from "./components/ExperiencePreviewHeader";
import { ExperienceUploadCard } from "./components/ExperienceUploadCard";
import { type DashboardNav, type DashboardDetailsRoute } from "../../navigation/types";

const BACKGROUND_COLOR = "#050505";

export const DashboardDetailsScreen = () => {
  const navigation = useNavigation<DashboardNav>();
  const route = useRoute<DashboardDetailsRoute>();
  const { card } = route.params;
  const { typography, sizes, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleUpload = useCallback(() => {
    // TODO: integrate with media picker
  }, []);

  const handleContinue = useCallback(() => {
    // TODO: integrate checkout or generation flow
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: BACKGROUND_COLOR }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: sizes.xl * 2 }}
        showsVerticalScrollIndicator={false}
      >
        <ExperiencePreviewHeader
          image={card.image}
          title={card.title}
          description={card.description}
          onClose={handleClose}
          topInset={insets.top}
        />

        <View style={[styles.body, { paddingHorizontal: sizes.lg, paddingTop: sizes.lg }]}>
          <View style={[styles.infoCard, { padding: sizes.lg }]}>
            <Text style={[typography.body, styles.infoTitle]}>Создайте жуткий сюрприз</Text>
            <Spacer size="xs" />
            <Text style={[typography.bodySm, styles.infoDescription]}>
              {card.description}
            </Text>
          </View>

          <ExperienceUploadCard onPress={handleUpload} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: sizes.lg, paddingBottom: insets.bottom + sizes.lg }]}>
        <Pressable
          onPress={handleContinue}
          style={[styles.continueButton, { paddingVertical: sizes.md, paddingHorizontal: sizes.lg }]}
        >
          <Text style={[typography.body, styles.continueText]}>Продолжить</Text>
          <View style={[styles.tokenWrapper, { backgroundColor: theme.primary }]}>
            <MaterialIcons
              name="diamond"
              size={18}
              color={"white"}
            />
            <Text style={[typography.body, { color: "white", fontWeight: "bold" }]}>{card.tokenCost}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  body: {
    gap: 20,
  },
  infoCard: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 4,
  },
  infoTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  infoDescription: {
    color: "rgba(255,255,255,0.72)",
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 12,
    backgroundColor: BACKGROUND_COLOR,
  },
  continueButton: {
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  continueText: {
    color: "#121212",
    fontWeight: "600",
  },
  tokenWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});

export default DashboardDetailsScreen;
