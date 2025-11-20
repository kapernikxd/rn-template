import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { launchImageLibrary, type Asset } from "react-native-image-picker";

import { useTheme } from "rn-vs-lb/theme";
import { Spacer } from "rn-vs-lb";
import { useTranslation } from "react-i18next";

import { ExperiencePreviewHeader } from "./components/ExperiencePreviewHeader";
import { ExperienceUploadCard } from "./components/ExperienceUploadCard";
import { type DashboardNav, type DashboardDetailsRoute } from "../../navigation/types";
import { useRootStore, useStoreData } from "../../store/StoreProvider";
import { getTokenBalance, subtractTokens } from "../../helpers/tokenStorage";

const BACKGROUND_COLOR = "#050505";

export const DashboardDetailsScreen = () => {
  const navigation = useNavigation<DashboardNav>();
  const route = useRoute<DashboardDetailsRoute>();
  const { card } = route.params;
  const { typography, sizes, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { imageGenerationStore, uiStore } = useRootStore();
  const [customPrompt, setCustomPrompt] = useState("");
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const { t } = useTranslation();

  const { selectedImage, isSubmitting } = useStoreData(
    imageGenerationStore,
    (store) => ({
      selectedImage: store.selectedImage,
      isSubmitting: store.isSubmitting,
    }),
  );

  const refreshTokenBalance = useCallback(async () => {
    try {
      const balance = await getTokenBalance();
      setTokenBalance(balance);
      return balance;
    } catch (error) {
      console.warn("Failed to load token balance", error);
      setTokenBalance(null);
      uiStore.showSnackbar(
        t("screens.dashboard.experience.details.errors.balanceLoad"),
        "error",
      );
      return null;
    }
  }, [t, uiStore]);

  useFocusEffect(
    useCallback(() => {
      void refreshTokenBalance();
    }, [refreshTokenBalance]),
  );

  const hasEnoughTokens = tokenBalance !== null && tokenBalance >= card.tokenCost;

  const continueDisabled = useMemo(
    () => !selectedImage || isSubmitting || !hasEnoughTokens,
    [selectedImage, isSubmitting, hasEnoughTokens],
  );

  const previewUri = selectedImage?.uri ?? null;

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleUpload = useCallback(() => {
    void (async () => {
      const result = await launchImageLibrary({
        mediaType: "photo",
        selectionLimit: 1,
        quality: 0.9,
      });

      if (result.didCancel) {
        return;
      }

      const assets = (result.assets ?? []).filter(
        (asset): asset is Asset & { uri: string } => Boolean(asset?.uri),
      );

      if (assets.length) {
        imageGenerationStore.setSelectedImages(assets.slice(0, 1));
      } else {
        imageGenerationStore.clearSelection();
      }
    })();
  }, [imageGenerationStore]);

  const handleRemoveImage = useCallback(() => {
    imageGenerationStore.clearSelection();
  }, [imageGenerationStore]);

  const handleContinue = useCallback(() => {
    if (!selectedImage) {
      Alert.alert(
        t("screens.dashboard.experience.details.alerts.uploadTitle"),
        t("screens.dashboard.experience.details.alerts.uploadMessage"),
      );
      return;
    }

    void (async () => {
      const balance = await refreshTokenBalance();

      if (balance === null) {
        return;
      }

      if (balance < card.tokenCost) {
        Alert.alert(
          t("screens.dashboard.experience.details.alerts.notEnoughTokensTitle"),
          t("screens.dashboard.experience.details.alerts.notEnoughTokensMessage"),
        );
        return;
      }

      const trimmedPrompt = customPrompt.trim();
      const combinedPrompt = trimmedPrompt
        ? `${card.generationPrompt}\n${t("screens.dashboard.experience.details.additionalPromptPrefix")} ${trimmedPrompt}`
        : card.generationPrompt;

      const success = await imageGenerationStore.submitEditRequest({
        prompt: combinedPrompt,
      });

      if (success) {
        try {
          const updatedBalance = await subtractTokens(card.tokenCost);
          setTokenBalance(updatedBalance);
        } catch (error) {
          console.warn("Failed to subtract tokens", error);
          uiStore.showSnackbar(
            t("screens.dashboard.experience.details.errors.balanceUpdate"),
            "error",
          );
        }
        Alert.alert(
          t("screens.dashboard.experience.details.alerts.requestSentTitle"),
          t("screens.dashboard.experience.details.alerts.requestSentMessage"),
        );
        setCustomPrompt("");
      } else {
        const message =
          imageGenerationStore.submitError ??
          t("screens.dashboard.experience.details.alerts.submitErrorFallback");
        Alert.alert(t("screens.dashboard.experience.details.alerts.errorTitle"), message);
      }
    })();
  }, [
    card.generationPrompt,
    card.tokenCost,
    customPrompt,
    imageGenerationStore,
    refreshTokenBalance,
    selectedImage,
    t,
    uiStore,
  ]);

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
          <View style={[styles.promptCard, { padding: sizes.lg }]}>
            <Text style={[typography.body, styles.promptLabel]}>
              {t("screens.dashboard.experience.details.promptLabel")}
            </Text>
            <Spacer size="xs" />
            <TextInput
              value={customPrompt}
              onChangeText={setCustomPrompt}
              placeholder={t("screens.dashboard.experience.details.promptPlaceholder")}
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              style={[styles.promptInput, { minHeight: sizes.xl * 2 }]}
              textAlignVertical="top"
            />
            <Spacer size="xs" />
            <Text style={[typography.bodySm, styles.promptHelper]}>
              {t("screens.dashboard.experience.details.promptHelper", { description: card.description })}
            </Text>
          </View>

          <ExperienceUploadCard onPress={handleUpload} />

          {previewUri ? (
            <View style={[styles.previewCard, { padding: sizes.md }]}>
              <Image
                source={{ uri: previewUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <Spacer size="sm" />
              <Pressable onPress={handleRemoveImage} style={styles.removeButton}>
                <Text style={[typography.bodySm, styles.removeButtonText]}>
                  {t("screens.dashboard.experience.details.removePhoto")}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: sizes.lg, paddingBottom: insets.bottom + sizes.lg }]}>
        <Pressable
          onPress={handleContinue}
          style={[
            styles.continueButton,
            {
              paddingVertical: sizes.md,
              paddingHorizontal: sizes.lg,
              opacity: continueDisabled ? 0.6 : 1,
            },
          ]}
          disabled={continueDisabled}
        >
          <Text style={[typography.body, styles.continueText]}>
            {isSubmitting
              ? t("screens.dashboard.experience.details.sending")
              : t("screens.dashboard.experience.details.continue")}
          </Text>
          <View style={styles.buttonRight}>
            <View style={[styles.tokenWrapper, { backgroundColor: theme.primary }]}>
              <MaterialIcons
                name="diamond"
                size={18}
                color={"white"}
              />
              <Text style={[typography.body, { color: "white", fontWeight: "bold" }]}>{card.tokenCost}</Text>
            </View>
            {isSubmitting ? <ActivityIndicator color={"#121212"} /> : null}
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
  promptCard: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 8,
  },
  promptLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  promptInput: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.2)",
    fontSize: 16,
    lineHeight: 22,
  },
  promptHelper: {
    color: "rgba(255,255,255,0.6)",
    lineHeight: 18,
  },
  previewCard: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 12,
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  removeButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
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
  buttonRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
