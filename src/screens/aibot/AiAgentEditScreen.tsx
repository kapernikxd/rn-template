import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { launchImageLibrary } from "react-native-image-picker";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Button, Spacer, StepProgress } from "rn-vs-lb";
import {
  SizesType,
  ThemeType,
  TypographytType,
  useTheme,
} from "rn-vs-lb/theme";

import { FormTextField, AiAgentHeader } from "./components";
import { useRootStore, useStoreData } from "../../store/StoreProvider";
import { useEditAiAgentDialog } from "../../helpers/hooks/aiAgent/useEditAiAgentDialog";
import { useSafeAreaColors } from "../../store/SafeAreaColorProvider";
import { ROUTES, RootStackParamList } from "../../navigation/types";
import { ScreenLoader } from "../../components";
import type { AvatarFile } from "../../types/profile";
import { categoryOptions } from "../../helpers/data/agent-create";
import { BackButton } from "../../components/buttons";
import { useTranslation } from "react-i18next";

const FALLBACK_IMAGE_TYPE = "image/jpeg";

const toAvatarFile = (asset: {
  uri?: string | null;
  fileName?: string | null;
  type?: string | null;
}, index: number): AvatarFile | null => {
  if (!asset.uri) return null;
  return {
    uri: asset.uri,
    name: asset.fileName ?? `image-${Date.now()}-${index}.jpg`,
    type: asset.type ?? FALLBACK_IMAGE_TYPE,
  };
};

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.AiAgentEdit>;

export const AiAgentEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { aiBotId } = route.params;
  const { aiBotStore } = useRootStore();
  const { theme, sizes, typography, isDark } = useTheme();
  const styles = useMemo(
    () => createStyles({ theme, sizes, typography, isDark }),
    [theme, sizes, typography, isDark],
  );
  const { setColors } = useSafeAreaColors();
  const { t } = useTranslation();

  const aiAgent = useStoreData(aiBotStore, (store) => store.selectAiBot);
  const isLoading = useStoreData(aiBotStore, (store) => store.isAiUserLoading);
  const steps = aiBotStore.steps;

  const [activeStep, setActiveStep] = useState(0);

  const {
    botPhotos,
    photosUpdating,
    maxGalleryItems,
    formState,
    setFormState,
    usefulnessInput,
    setUsefulnessInput,
    avatarPreview,
    isSubmitting,
    charCounters,
    selectedCategories,
    remainingGallerySlots,
    canUploadPhotos,
    handleAvatarSelect,
    handleAvatarRemove,
    toggleCategory,
    handleAddUsefulness,
    handleRemoveUsefulness,
    uploadGalleryFiles,
    handleRemovePhoto,
    submit,
  } = useEditAiAgentDialog(Boolean(aiAgent), aiAgent, () => navigation.goBack());

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.background,
    });
  }, [setColors, theme.background]);

  useEffect(() => {
    void aiBotStore.fetchAiBotById(aiBotId);
    void aiBotStore.fetchBotDetails(aiBotId);
  }, [aiBotId, aiBotStore]);

  const handleBack = useCallback(() => {
    if (activeStep === 0) {
      navigation.goBack();
      return;
    }
    setActiveStep((prev) => Math.max(0, prev - 1));
  }, [activeStep, navigation]);

  const handlePickAvatar = useCallback(async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1,
      quality: 0.9,
    });
    if (result.didCancel) return;
    const asset = result.assets?.[0];
    const file = asset ? toAvatarFile(asset, 0) : null;
    if (file) {
      handleAvatarSelect(file);
    }
  }, [handleAvatarSelect]);

  const handlePickGallery = useCallback(async () => {
    if (!canUploadPhotos || !aiAgent) return;
    const remaining = Math.max(0, maxGalleryItems - botPhotos.length);
    if (remaining <= 0) return;

    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: Math.min(remaining, 10),
      quality: 0.9,
    });
    if (result.didCancel) return;

    const files = (result.assets ?? [])
      .map((asset, index) => toAvatarFile(asset, index))
      .filter((file): file is AvatarFile => Boolean(file));

    if (files.length) {
      await uploadGalleryFiles(files);
    }
  }, [aiAgent, botPhotos.length, canUploadPhotos, maxGalleryItems, uploadGalleryFiles]);

  const handleNext = useCallback(() => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
      return;
    }
    if (!isSubmitting) {
      void submit();
    }
  }, [activeStep, isSubmitting, steps.length, submit]);

  if (isLoading && !aiAgent) {
    return <ScreenLoader />;
  }

  const localizedSteps = useMemo(
    () =>
      steps.map((item, index) => ({
        ...item,
        title: t(`screens.aibot.edit.steps.${index}.title`),
        description: t(`screens.aibot.edit.steps.${index}.description`),
      })),
    [steps, t],
  );

  const getCategoryLabel = useCallback(
    (category: string) => {
      const normalized = category.trim().toLowerCase().replace(/\s+/g, "-");
      const key = `screens.aibot.common.categories.${normalized}`;
      const translated = t(key);
      return translated === key ? category : translated;
    },
    [t],
  );

  const renderIdentityStep = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('screens.aibot.edit.identity.title')}</Text>
      <Text style={styles.sectionDescription}>
        {t('screens.aibot.edit.identity.description')}
      </Text>

      <View style={styles.avatarRow}>
        <TouchableOpacity style={styles.avatarButton} onPress={handlePickAvatar}>
          {avatarPreview ? (
            <Image source={{ uri: avatarPreview }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="image-outline" size={28} color={theme.greyText} />
              <Text style={styles.avatarPlaceholderText}>
                {t('screens.aibot.edit.identity.avatar.placeholder')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.avatarInfo}>
          <Text style={styles.avatarHint}>{t('screens.aibot.edit.identity.avatar.hint')}</Text>
          <Button title={t('common.delete')} type="gray-outline" onPress={handleAvatarRemove} />
        </View>
      </View>

      <FormTextField
        label={t('screens.aibot.edit.identity.fields.firstName.label')}
        labelRight={charCounters.name}
        value={formState.name}
        onChangeText={(text) => setFormState((prev) => ({ ...prev, name: text }))}
        placeholder={t('screens.aibot.edit.identity.fields.firstName.placeholder')}
      />
      <FormTextField
        label={t('screens.aibot.edit.identity.fields.lastName.label')}
        labelRight={charCounters.lastname}
        value={formState.lastname}
        onChangeText={(text) => setFormState((prev) => ({ ...prev, lastname: text }))}
        placeholder={t('screens.aibot.edit.identity.fields.lastName.placeholder')}
      />
      <FormTextField
        label={t('screens.aibot.edit.identity.fields.profession.label')}
        labelRight={charCounters.profession}
        value={formState.profession}
        onChangeText={(text) => setFormState((prev) => ({ ...prev, profession: text }))}
        placeholder={t('screens.aibot.edit.identity.fields.profession.placeholder')}
      />
    </View>
  );

  const renderFocusStep = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('screens.aibot.edit.focus.title')}</Text>
      <Text style={styles.sectionDescription}>
        {t('screens.aibot.edit.focus.description')}
      </Text>

      <Text style={styles.subSectionTitle}>{t('screens.aibot.edit.focus.categoriesTitle')}</Text>
      <View style={styles.chipsContainer}>
        {categoryOptions.map((category) => {
          const normalized = category.trim().toLowerCase();
          const isActive = selectedCategories.has(normalized);
          return (
            <TouchableOpacity
              key={category}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => toggleCategory(category)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {getCategoryLabel(category)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.subSectionTitle}>{t('screens.aibot.edit.focus.usefulnessTitle')}</Text>
      <View style={styles.usefulnessInputRow}>
        <FormTextField
          label=""
          value={usefulnessInput}
          onChangeText={setUsefulnessInput}
          placeholder={t('screens.aibot.edit.focus.usefulnessPlaceholder')}
          containerStyle={styles.usefulnessField}
          inputStyle={styles.usefulnessInput}
          onSubmitEditing={handleAddUsefulness}
          returnKeyType="done"
        />
        <Button leftIcon={<FontAwesome6 name="add" color={theme.white} size={24} />} onPress={handleAddUsefulness} disabled={!usefulnessInput.trim()} />
      </View>
      <View style={styles.usefulnessList}>
        {formState.usefulness.map((item) => (
          <View key={item} style={styles.usefulnessChip}>
            <Text style={styles.usefulnessText}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveUsefulness(item)} style={styles.usefulnessRemove}>
              <Ionicons name="close" size={14} color={theme.greyText} />
            </TouchableOpacity>
          </View>
        ))}
        {!formState.usefulness.length ? (
          <Text style={styles.usefulnessEmpty}>{t('screens.aibot.edit.focus.usefulnessEmpty')}</Text>
        ) : null}
      </View>
    </View>
  );

  const renderVoiceStep = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('screens.aibot.edit.voice.title')}</Text>
      <Text style={styles.sectionDescription}>
        {t('screens.aibot.edit.voice.description')}
      </Text>

      <FormTextField
        label={t('screens.aibot.edit.voice.fields.prompt.label')}
        labelRight={`${formState.aiPrompt.length}`}
        value={formState.aiPrompt}
        onChangeText={(text) => setFormState((prev) => ({ ...prev, aiPrompt: text }))}
        placeholder={t('screens.aibot.edit.voice.fields.prompt.placeholder')}
        multiline
      />
      <FormTextField
        label={t('screens.aibot.edit.voice.fields.description.label')}
        labelRight={charCounters.userBio}
        value={formState.userBio}
        onChangeText={(text) => setFormState((prev) => ({ ...prev, userBio: text }))}
        placeholder={t('screens.aibot.edit.voice.fields.description.placeholder')}
        multiline
      />
      <FormTextField
        label={t('screens.aibot.edit.voice.fields.intro.label')}
        value={formState.intro}
        onChangeText={(text) => setFormState((prev) => ({ ...prev, intro: text }))}
        placeholder={t('screens.aibot.edit.voice.fields.intro.placeholder')}
        multiline
      />
    </View>
  );

  const renderMediaStep = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('screens.aibot.edit.media.title')}</Text>
      <Text style={styles.sectionDescription}>
        {t('screens.aibot.edit.media.description', {
          remaining: remainingGallerySlots,
          max: maxGalleryItems,
        })}
      </Text>

      <Button
        title={
          remainingGallerySlots
            ? t('screens.aibot.edit.media.upload')
            : t('screens.aibot.edit.media.limitReached')
        }
        type="primary-outline"
        onPress={handlePickGallery}
        disabled={!canUploadPhotos || photosUpdating}
        loading={photosUpdating}
      />

      <View style={styles.galleryGrid}>
        {botPhotos.map((photo) => (
          <View key={photo} style={styles.galleryItem}>
            <Image source={{ uri: photo }} style={styles.galleryImage} />
            <TouchableOpacity style={styles.galleryRemove} onPress={() => handleRemovePhoto(photo)}>
              <Ionicons name="trash" size={16} color={theme.white} />
            </TouchableOpacity>
          </View>
        ))}
        {!botPhotos.length ? (
          <Text style={styles.galleryEmpty}>{t('screens.aibot.edit.media.empty')}</Text>
        ) : null}
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderIdentityStep();
      case 1:
        return renderFocusStep();
      case 2:
        return renderVoiceStep();
      default:
        return renderMediaStep();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <AiAgentHeader
          theme={theme}
          title={t('screens.aibot.edit.headerTitle')}
          onBack={handleBack}
        />
        <Spacer />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.stepContainer}>
          <StepProgress steps={localizedSteps} activeStep={Math.min(activeStep, steps.length - 1)} />
        </View>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          leftIcon={<Ionicons name={activeStep === 0 ? "close-outline" : "caret-back-outline"} color={theme.text} size={18} />}
          // title={activeStep === 0 ? t('common.cancel') : t('common.back')}
          type="gray-outline"
          onPress={handleBack}
          disabled={isSubmitting}
        />
        <View style={{ width: "80%" }}>
          <Button
            title={
              activeStep === steps.length - 1
                ? t('screens.aibot.edit.actions.save')
                : t('common.next')
            }
            onPress={handleNext}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = ({
  theme,
  sizes,
  typography,
  isDark,
}: {
  theme: ThemeType;
  sizes: SizesType;
  typography: TypographytType;
  isDark: boolean;
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: sizes.xs as number,
      paddingBottom: sizes.lg as number,
    },
    flex: {
      flex: 1,
    },
    headerTitle: {
      ...typography.titleH4,
      color: theme.text,
    },
    scrollContent: {
      paddingHorizontal: sizes.xs as number,
      paddingBottom: (sizes.xl as number) * 2,
    },
    stepContainer: {
      paddingHorizontal: sizes.xs as number,
    },
    card: {
      backgroundColor: isDark ? theme.card : theme.white,
      borderRadius: 24,
      padding: sizes.lg as number,
      marginBottom: sizes.xl as number,
      shadowColor: isDark ? "#000" : "#1f1f1f",
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    sectionTitle: {
      ...typography.titleH4,
      // color: theme.text,
      marginBottom: sizes.sm as number,
    },
    sectionDescription: {
      ...typography.bodySm,
      color: theme.greyText,
      marginBottom: sizes.lg as number,
    },
    subSectionTitle: {
      ...typography.bodySm,
      color: theme.text,
      marginBottom: sizes.sm as number,
      fontWeight: '600',
    },
    avatarRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: sizes.xl as number,
    },
    avatarButton: {
      width: 96,
      height: 96,
      borderRadius: 28,
      backgroundColor: isDark ? theme.backgroundSecond : theme.backgroundLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: sizes.md as number,
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    avatarPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
    },
    avatarPlaceholderText: {
      ...typography.bodyXs,
      color: theme.greyText,
      marginTop: 4,
    },
    avatarInfo: {
      flex: 1,
    },
    avatarHint: {
      ...typography.bodyXs,
      color: theme.greyText,
      marginBottom: sizes.sm as number,
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: sizes.sm as number,
      marginBottom: sizes.lg as number,
    },
    chip: {
      paddingHorizontal: sizes.md as number,
      paddingVertical: sizes.xs as number,
      borderRadius: 999,
      backgroundColor: isDark ? theme.backgroundSecond : theme.backgroundLight,
    },
    chipActive: {
      backgroundColor: theme.primary,
    },
    chipText: {
      ...typography.bodyXs,
      color: theme.text,
    },
    chipTextActive: {
      color: theme.white,
    },
    usefulnessInputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: sizes.sm as number,
      marginBottom: sizes.md as number,
    },
    usefulnessField: {
      flex: 1,
      marginBottom: 0,
    },
    usefulnessInput: {
      backgroundColor: isDark ? theme.backgroundSecond : theme.white,
    },
    usefulnessList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: sizes.sm as number,
    },
    usefulnessChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? theme.backgroundSecond : theme.backgroundLight,
      borderRadius: 999,
      paddingHorizontal: sizes.md as number,
      paddingVertical: sizes.xs as number,
    },
    usefulnessText: {
      ...typography.bodyXs,
      color: theme.text,
      marginRight: 4,
    },
    usefulnessRemove: {
      padding: 4,
    },
    usefulnessEmpty: {
      ...typography.bodyXs,
      color: theme.greyText,
    },
    galleryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: sizes.md as number,
      marginTop: sizes.lg as number,
    },
    galleryItem: {
      width: 120,
      height: 120,
      borderRadius: 18,
      overflow: "hidden",
      position: "relative",
      backgroundColor: isDark ? theme.backgroundSecond : theme.backgroundLight,
    },
    galleryImage: {
      width: "100%",
      height: "100%",
    },
    galleryRemove: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },
    galleryEmpty: {
      ...typography.bodyXs,
      color: theme.greyText,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: sizes.lg as number,
      paddingVertical: sizes.md as number,
      gap: sizes.md as number,
      backgroundColor: theme.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
  });


