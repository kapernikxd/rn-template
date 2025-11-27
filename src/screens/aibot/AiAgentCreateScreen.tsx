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
import { FontAwesome6, Ionicons, Octicons } from "@expo/vector-icons";
import { Button, Spacer, StepProgress } from "rn-vs-lb";
import {
  SizesType,
  ThemeType,
  TypographytType,
  useTheme,
} from "rn-vs-lb/theme";

import { FormTextField, AiAgentHeader } from "./components";
import { useCreateAiAgentPage } from "../../helpers/hooks/aiAgent/useCreateAiAgentPage";
import { categoryOptions } from "../../helpers/data/agent-create";
import { useSafeAreaColors } from "../../store/SafeAreaColorProvider";
import { ROUTES, RootStackParamList } from "../../navigation/types";
import type { AvatarFile } from "../../types/profile";
import { usePortalNavigation } from "../../helpers/hooks";
import { BackButton } from "../../components/buttons";
import { useTranslation } from "react-i18next";

const FALLBACK_IMAGE_TYPE = "image/jpeg";

const toAvatarFile = (asset: {
  uri?: string | null;
  fileName?: string | null;
  type?: string | null;
}, index: number): AvatarFile | null => {
  if (!asset.uri) {
    return null;
  }
  const name = asset.fileName ?? `image-${Date.now()}-${index}.jpg`;
  return {
    uri: asset.uri,
    name,
    type: asset.type ?? FALLBACK_IMAGE_TYPE,
  };
};

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.AiAgentCreate>;

export const AiAgentCreateScreen: React.FC = () => {
  const { goBack } = usePortalNavigation();
  const { theme, sizes, typography, isDark } = useTheme();
  const styles = useMemo(
    () => createStyles({ theme, sizes, typography, isDark }),
    [theme, sizes, typography, isDark],
  );
  const { setColors } = useSafeAreaColors();
  const { t } = useTranslation();

  const {
    step,
    steps,
    form,
    avatarPreview,
    gallery,
    completed,
    currentStepComplete,
    isSubmitting,
    creationError,
    createdBot,
    maxGalleryItems,
    getAiProfile,
    setAvatarFile,
    addGalleryFiles,
    removeGalleryItem,
    resetFlow,
    handleChange,
    goNext,
    goToStep,
  } = useCreateAiAgentPage();

  const [usefulnessDraft, setUsefulnessDraft] = useState("");

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.white
    });
  }, [setColors, theme.background]);

  const handleCancel = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleStepPress = useCallback(
    (targetStep: number) => {
      if (completed) {
        return;
      }

      goToStep(targetStep);
    },
    [completed, goToStep],
  );

  const handlePickAvatar = useCallback(async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1,
      quality: 0.9,
    });

    if (result.didCancel) return;

    const asset = result.assets?.[0];
    const file = asset ? toAvatarFile(asset, 0) : null;
    await setAvatarFile(file);
  }, [setAvatarFile]);

  const handleRemoveAvatar = useCallback(() => {
    setAvatarFile(null);
  }, [setAvatarFile]);

  const handlePickGallery = useCallback(async () => {
    const remaining = Math.max(0, maxGalleryItems - gallery.length);
    if (remaining <= 0) {
      return;
    }

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
      await addGalleryFiles(files);
    }
  }, [addGalleryFiles, gallery.length, maxGalleryItems]);

  const toggleCategory = useCallback(
    (category: string) => {
      const normalized = category.trim().toLowerCase();
      const exists = form.categories.some((item) => item.trim().toLowerCase() === normalized);
      const next = exists
        ? form.categories.filter((item) => item.trim().toLowerCase() !== normalized)
        : [...form.categories, category];
      handleChange("categories", next);
    },
    [form.categories, handleChange],
  );

  const handleAddUsefulness = useCallback(() => {
    const value = usefulnessDraft.trim();
    if (!value) return;
    const exists = form.usefulness.some((item) => item.trim().toLowerCase() === value.toLowerCase());
    if (exists) {
      setUsefulnessDraft("");
      return;
    }
    handleChange("usefulness", [...form.usefulness, value]);
    setUsefulnessDraft("");
  }, [form.usefulness, handleChange, usefulnessDraft]);

  const handleRemoveUsefulness = useCallback(
    (value: string) => {
      handleChange(
        "usefulness",
        form.usefulness.filter((item) => item !== value),
      );
    },
    [form.usefulness, handleChange],
  );

  const handleSubmitStep = useCallback(() => {
    if (!currentStepComplete || isSubmitting) {
      return;
    }
    goNext();
  }, [currentStepComplete, goNext, isSubmitting]);

  const remainingGallerySlots = Math.max(0, maxGalleryItems - gallery.length);

  const localizedSteps = useMemo(
    () =>
      steps.map((item, index) => ({
        ...item,
        title: t(`screens.aibot.create.steps.${index}.title`),
        description: t(`screens.aibot.create.steps.${index}.description`),
      })),
    [steps, t],
  );

  const genderOptions = useMemo(
    () => [
      { label: t('settings.editProfile.options.gender.male'), value: 'male' },
      { label: t('settings.editProfile.options.gender.female'), value: 'female' },
    ],
    [t],
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
      <Text style={styles.sectionTitle}>{t('screens.aibot.create.identity.title')}</Text>
      <Text style={styles.sectionDescription}>
        {t('screens.aibot.create.identity.description')}
      </Text>

      <View style={styles.avatarRow}>
        <TouchableOpacity style={styles.avatarButton} onPress={handlePickAvatar}>
          {avatarPreview ? (
            <Image source={{ uri: avatarPreview }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="image-outline" size={28} color={theme.greyText} />
              <Text style={styles.avatarPlaceholderText}>
                {t('screens.aibot.create.identity.avatar.placeholder')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.avatarInfo}>
          <Text style={styles.avatarHint}>{t('screens.aibot.create.identity.avatar.hint')}</Text>
          {avatarPreview ? (
            <Button title={t('common.delete')} type="gray-outline" onPress={handleRemoveAvatar} />
          ) : null}
        </View>
      </View>

      <FormTextField
        label={t('screens.aibot.create.identity.fields.firstName.label')}
        value={form.firstName}
        onChangeText={(text) => handleChange("firstName", text)}
        placeholder={t('screens.aibot.create.identity.fields.firstName.placeholder')}
      />
      <FormTextField
        label={t('screens.aibot.create.identity.fields.lastName.label')}
        value={form.lastName}
        onChangeText={(text) => handleChange("lastName", text)}
        placeholder={t('screens.aibot.create.identity.fields.lastName.placeholder')}
      />
      <Text style={styles.subSectionTitle}>{t('screens.aibot.create.identity.fields.gender.label')}</Text>
      <View style={styles.genderRow}>
        {genderOptions.map((option) => {
          const isSelected = form.gender === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.genderChip, isSelected && styles.genderChipActive]}
              onPress={() => handleChange('gender', option.value)}
            >
              <Text style={[styles.genderText, isSelected && styles.genderTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FormTextField
        label={t('screens.aibot.create.identity.fields.profession.label')}
        value={form.profession}
        onChangeText={(text) => handleChange("profession", text)}
        placeholder={t('screens.aibot.create.identity.fields.profession.placeholder')}
      />
    </View>
  );

  const renderFocusStep = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('screens.aibot.create.focus.title')}</Text>
      <Text style={styles.sectionDescription}>
        {t('screens.aibot.create.focus.description')}
      </Text>

      <Text style={styles.subSectionTitle}>{t('screens.aibot.create.focus.categoriesTitle')}</Text>
      <View style={styles.chipsContainer}>
        {categoryOptions.map((category) => {
          const normalized = category.trim().toLowerCase();
          const isActive = form.categories.some((item) => item.trim().toLowerCase() === normalized);
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

      <Text style={styles.subSectionTitle}>{t('screens.aibot.create.focus.usefulnessTitle')}</Text>
      <View style={styles.usefulnessInputRow}>
        <FormTextField
          label=""
          value={usefulnessDraft}
          onChangeText={setUsefulnessDraft}
          placeholder={t('screens.aibot.create.focus.usefulnessPlaceholder')}
          containerStyle={styles.usefulnessField}
          inputStyle={styles.usefulnessInput}
          onSubmitEditing={handleAddUsefulness}
          returnKeyType="done"
        />
        <Button leftIcon={<FontAwesome6 name="add" color={theme.white} size={24} />} onPress={handleAddUsefulness} disabled={!usefulnessDraft.trim()} />
      </View>
      <View style={styles.usefulnessList}>
        {form.usefulness.map((item) => (
          <View key={item} style={styles.usefulnessChip}>
            <Text style={styles.usefulnessText}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveUsefulness(item)} style={styles.usefulnessRemove}>
              <Ionicons name="close" size={14} color={theme.greyText} />
            </TouchableOpacity>
          </View>
        ))}
        {!form.usefulness.length ? (
          <Text style={styles.usefulnessEmpty}>{t('screens.aibot.create.focus.usefulnessEmpty')}</Text>
        ) : null}
      </View>
    </View>
  );

  const renderVoiceStep = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('screens.aibot.create.voice.title')}</Text>
      <Text style={styles.sectionDescription}>
        {t('screens.aibot.create.voice.description')}
      </Text>

      <FormTextField
        label={t('screens.aibot.create.voice.fields.prompt.label')}
        labelRight={`${form.prompt.length}`}
        value={form.prompt}
        onChangeText={(text) => handleChange("prompt", text)}
        placeholder={t('screens.aibot.create.voice.fields.prompt.placeholder')}
        multiline
      />
      <FormTextField
        label={t('screens.aibot.create.voice.fields.description.label')}
        value={form.description}
        onChangeText={(text) => handleChange("description", text)}
        placeholder={t('screens.aibot.create.voice.fields.description.placeholder')}
        multiline
      />
      <FormTextField
        label={t('screens.aibot.create.voice.fields.intro.label')}
        value={form.intro}
        onChangeText={(text) => handleChange("intro", text)}
        placeholder={t('screens.aibot.create.voice.fields.intro.placeholder')}
        multiline
      />
    </View>
  );

  const renderMediaStep = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('screens.aibot.create.media.title')}</Text>
      <Text style={styles.sectionDescription}>
        {t('screens.aibot.create.media.description', {
          remaining: remainingGallerySlots,
          max: maxGalleryItems,
        })}
      </Text>

      <Button
        title={
          remainingGallerySlots
            ? t('screens.aibot.create.media.upload')
            : t('screens.aibot.create.media.limitReached')
        }
        onPress={handlePickGallery}
        disabled={remainingGallerySlots === 0}
        type="primary-outline"
      />

      <View style={styles.galleryGrid}>
        {gallery.map((item) => (
          <View key={item.id} style={styles.galleryItem}>
            <Image source={{ uri: item.preview }} style={styles.galleryImage} />
            <TouchableOpacity
              style={styles.galleryRemove}
              onPress={() => removeGalleryItem(item.id)}
            >
              <Ionicons name="trash" size={16} color={theme.white} />
            </TouchableOpacity>
          </View>
        ))}
        {!gallery.length ? (
          <Text style={styles.galleryEmpty}>{t('screens.aibot.create.media.empty')}</Text>
        ) : null}
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (step) {
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

  const handleViewProfile = useCallback(() => {
    if (!createdBot?._id) {
      return;
    }
    getAiProfile(createdBot._id);
  }, [createdBot, getAiProfile]);

  const renderCompleted = () => (
    <View style={styles.cardCentered}>
      <Ionicons name="sparkles" size={48} color={theme.primary} />
      <Text style={styles.completedTitle}>{t('screens.aibot.create.completed.title')}</Text>
      {createdBot ? (
        <Text style={styles.completedSubtitle}>
          {t('screens.aibot.create.completed.subtitleWithName', {
            name: createdBot.name,
            lastname: createdBot.lastname,
          })}
        </Text>
      ) : (
        <Text style={styles.completedSubtitle}>
          {t('screens.aibot.create.completed.subtitleDefault')}
        </Text>
      )}

      <View style={styles.completedActions}>
        {createdBot?._id ? (
          <Button title={t('screens.aibot.create.completed.openProfile')} onPress={handleViewProfile} />
        ) : null}
        <Button
          title={t('screens.aibot.create.completed.createAnother')}
          type="primary-outline"
          onPress={() => {
            resetFlow();
            setUsefulnessDraft("");
          }}
        />
        <Button title={t('common.done')} type="gray-outline" onPress={() => goBack()} />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <AiAgentHeader
          theme={theme}
          title={t('screens.aibot.create.headerTitle')}
          onBack={handleCancel}
        />
        <Spacer />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.stepContainer}>
          <StepProgress
            steps={localizedSteps}
            activeStep={Math.min(step, steps.length - 1)}
            onStepPress={handleStepPress}
          />
        </View>
        {creationError && !completed ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={theme.danger} />
            <Text style={styles.errorText}>{creationError}</Text>
          </View>
        ) : null}

        {completed ? renderCompleted() : renderStepContent()}
      </ScrollView>

      {!completed ? (
        <View style={[styles.footer, step > 0 && styles.footerSingleAction]}>
          {step === 0 ? (
            <Button leftIcon={<Ionicons name={"close-outline"} color={theme.text} size={18} />} type="gray-outline" onPress={handleCancel} disabled={isSubmitting} />
          ) : null}
          <View style={step === 0 ? { width: "80%" } : { width: "100%" }}>
            <Button
              title={
                step === steps.length - 1
                  ? t('screens.aibot.create.actions.submit')
                  : t('common.next')
              }
              onPress={handleSubmitStep}
              loading={isSubmitting}
              disabled={!currentStepComplete || isSubmitting}
            />
          </View>
        </View>
      ) : null}
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
    flex: {
      flex: 1,
      backgroundColor: theme.background
    },
    header: {
      paddingHorizontal: sizes.xs as number,
      paddingBottom: sizes.lg as number,
    },
    headerBackButton: {
      marginRight: sizes.md as number,
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
      shadowOpacity: isDark ? 0.45 : 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    cardCentered: {
      backgroundColor: isDark ? theme.card : theme.white,
      borderRadius: 24,
      padding: sizes.lg as number,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: sizes.xl as number,
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
      marginBottom: 12,
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
      marginBottom: sizes.lg as number,
      gap: sizes.sm as number,
    },
    genderRow: {
      flexDirection: "row",
      gap: sizes.sm as number,
      marginBottom: sizes.lg as number,
    },
    genderChip: {
      paddingHorizontal: sizes.md as number,
      paddingVertical: sizes.xs as number,
      borderRadius: 12,
      backgroundColor: isDark ? theme.backgroundSecond : theme.backgroundLight,
    },
    genderChipActive: {
      backgroundColor: theme.primary,
    },
    genderText: {
      ...typography.bodySm,
      color: theme.text,
    },
    genderTextActive: {
      color: theme.white,
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
      marginTop: -24,
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
      alignItems: "center",
      paddingHorizontal: sizes.lg as number,
      paddingVertical: sizes.md as number,
      gap: sizes.md as number,
      backgroundColor: theme.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    footerSingleAction: {
      justifyContent: "flex-end",
    },
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      padding: sizes.md as number,
      borderRadius: 18,
      backgroundColor: isDark ? "rgba(255,69,58,0.12)" : "rgba(255,69,58,0.1)",
      marginBottom: sizes.lg as number,
      gap: sizes.sm as number,
    },
    errorText: {
      ...typography.bodySm,
      color: theme.danger,
      flex: 1,
    },
    completedTitle: {
      ...typography.titleH3,
      color: theme.text,
      marginTop: sizes.md as number,
    },
    completedSubtitle: {
      ...typography.bodySm,
      color: theme.greyText,
      textAlign: "center",
      marginTop: sizes.sm as number,
      marginBottom: sizes.lg as number,
    },
    completedActions: {
      width: "100%",
      gap: sizes.sm as number,
    },
  });

