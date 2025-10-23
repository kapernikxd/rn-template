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
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { launchImageLibrary } from "react-native-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "rn-vs-lb";
import {
  SizesType,
  ThemeType,
  TypographytType,
  useTheme,
} from "rn-vs-lb/theme";

import { StepProgress, FormTextField } from "./components";
import { useCreateAiAgentPage } from "../../helpers/hooks/aiAgent/useCreateAiAgentPage";
import { categoryOptions } from "../../helpers/data/agent-create";
import { useSafeAreaColors } from "../../store/SafeAreaColorProvider";
import { ROUTES, RootStackParamList } from "../../navigation/types";
import type { AvatarFile } from "../../types/profile";

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

export const AiAgentCreateScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, sizes, typography, isDark } = useTheme();
  const styles = useMemo(
    () => createStyles({ theme, sizes, typography, isDark }),
    [theme, sizes, typography, isDark],
  );
  const { setColors } = useSafeAreaColors();

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
    goPrev,
  } = useCreateAiAgentPage();

  const [usefulnessDraft, setUsefulnessDraft] = useState("");

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.background,
      contentColor: theme.background,
    });
  }, [setColors, theme.background]);

  const handleBack = useCallback(() => {
    if (completed) {
      navigation.goBack();
      return;
    }

    if (step === 0) {
      navigation.goBack();
    } else {
      goPrev();
    }
  }, [completed, goPrev, navigation, step]);

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

  const renderIdentityStep = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Персонализация</Text>
      <Text style={styles.sectionDescription}>
        Добавьте изображение и базовую информацию, чтобы пользователи сразу узнали вашего агента.
      </Text>

      <View style={styles.avatarRow}>
        <TouchableOpacity style={styles.avatarButton} onPress={handlePickAvatar}>
          {avatarPreview ? (
            <Image source={{ uri: avatarPreview }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="image-outline" size={28} color={theme.greyText} />
              <Text style={styles.avatarPlaceholderText}>Загрузить</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.avatarInfo}>
          <Text style={styles.avatarHint}>Рекомендуется квадратное изображение не менее 512×512 px.</Text>
          {avatarPreview ? (
            <Button title="Удалить" type="gray-outline" onPress={handleRemoveAvatar} />
          ) : null}
        </View>
      </View>

      <FormTextField
        label="Имя"
        value={form.firstName}
        onChangeText={(text) => handleChange("firstName", text)}
        placeholder="Введите имя агента"
      />
      <FormTextField
        label="Фамилия"
        value={form.lastName}
        onChangeText={(text) => handleChange("lastName", text)}
        placeholder="Введите фамилию"
      />
      <FormTextField
        label="Профессия или роль"
        value={form.profession}
        onChangeText={(text) => handleChange("profession", text)}
        placeholder="Например, маркетолог или преподаватель"
      />
    </View>
  );

  const renderFocusStep = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Ценность и аудитория</Text>
      <Text style={styles.sectionDescription}>
        Выберите категории и сформулируйте, чем полезен ваш агент.
      </Text>

      <Text style={styles.subSectionTitle}>Категории</Text>
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
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{category}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.subSectionTitle}>Чем будет полезен агент?</Text>
      <View style={styles.usefulnessInputRow}>
        <FormTextField
          label=""
          value={usefulnessDraft}
          onChangeText={setUsefulnessDraft}
          placeholder="Добавьте ценность"
          containerStyle={styles.usefulnessField}
          inputStyle={styles.usefulnessInput}
          onSubmitEditing={handleAddUsefulness}
          returnKeyType="done"
        />
        <Button title="Добавить" onPress={handleAddUsefulness} disabled={!usefulnessDraft.trim()} />
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
          <Text style={styles.usefulnessEmpty}>Добавьте хотя бы один пункт ценности.</Text>
        ) : null}
      </View>
    </View>
  );

  const renderVoiceStep = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Голос и история</Text>
      <Text style={styles.sectionDescription}>
        Опишите характер, легенду и стартовое сообщение агента.
      </Text>

      <FormTextField
        label="Системный промт"
        labelRight={`${form.prompt.length}`}
        value={form.prompt}
        onChangeText={(text) => handleChange("prompt", text)}
        placeholder="Опишите поведение и стиль общения"
        multiline
      />
      <FormTextField
        label="Описание профиля"
        value={form.description}
        onChangeText={(text) => handleChange("description", text)}
        placeholder="Расскажите, чем занимается агент"
        multiline
      />
      <FormTextField
        label="Приветственное сообщение"
        value={form.intro}
        onChangeText={(text) => handleChange("intro", text)}
        placeholder="Что агент скажет в начале диалога"
        multiline
      />
    </View>
  );

  const renderMediaStep = () => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Медиа-набор</Text>
      <Text style={styles.sectionDescription}>
        Подготовьте визуальные материалы для галереи. Осталось {remainingGallerySlots} из {maxGalleryItems}.
      </Text>

      <Button
        title={remainingGallerySlots ? "Загрузить изображения" : "Лимит загруженных изображений"}
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
          <Text style={styles.galleryEmpty}>Вы ещё не добавили изображения.</Text>
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
      <Text style={styles.completedTitle}>AI-агент создан!</Text>
      {createdBot ? (
        <Text style={styles.completedSubtitle}>
          {createdBot.name} {createdBot.lastname} готов знакомиться с пользователями.
        </Text>
      ) : (
        <Text style={styles.completedSubtitle}>Ваш агент готов знакомиться с пользователями.</Text>
      )}

      <View style={styles.completedActions}>
        {createdBot?._id ? (
          <Button title="Открыть профиль" onPress={handleViewProfile} />
        ) : null}
        <Button
          title="Создать ещё"
          type="primary-outline"
          onPress={() => {
            resetFlow();
            setUsefulnessDraft("");
          }}
        />
        <Button title="Готово" type="gray-outline" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Создание AI-агента</Text>
        </View>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <StepProgress steps={steps} activeStep={Math.min(step, steps.length - 1)} />
          {creationError && !completed ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={theme.danger} />
              <Text style={styles.errorText}>{creationError}</Text>
            </View>
          ) : null}

          {completed ? renderCompleted() : renderStepContent()}
        </ScrollView>

        {!completed ? (
          <View style={styles.footer}>
            <Button
              title={step === 0 ? "Отмена" : "Назад"}
              type="gray-outline"
              onPress={handleBack}
              disabled={isSubmitting}
            />
            <Button
              title={step === steps.length - 1 ? "Создать" : "Далее"}
              onPress={handleSubmitStep}
              loading={isSubmitting}
              disabled={!currentStepComplete || isSubmitting}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    flex: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: sizes.lg as number,
      paddingVertical: sizes.md as number,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      marginRight: sizes.md as number,
    },
    headerTitle: {
      ...typography.titleH4,
      color: theme.text,
    },
    scrollContent: {
      paddingHorizontal: sizes.lg as number,
      paddingBottom: (sizes.xl as number) * 2,
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
      color: theme.text,
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
      marginBottom: sizes.lg as number,
      gap: sizes.sm as number,
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

