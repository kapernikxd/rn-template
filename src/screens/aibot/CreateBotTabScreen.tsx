import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "rn-vs-lb";
import { SizesType, ThemeType, TypographytType, useTheme } from "rn-vs-lb/theme";

import { FormTextField } from "./components";
import { categoryOptions } from "../../helpers/data/agent-create";
import { useCreateAiAgentPage } from "../../helpers/hooks/aiAgent/useCreateAiAgentPage";
import { useRootStore } from "../../store/StoreProvider";

const createStyles = ({
  theme,
  typography,
  sizes,
  isDark,
}: {
  theme: ThemeType;
  typography: TypographytType;
  sizes: SizesType;
  isDark: boolean;
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: sizes.lg as number,
      paddingTop: sizes.lg as number,
      paddingBottom: (sizes.xl as number) * 2,
    },
    header: {
      marginBottom: sizes.lg as number,
    },
    headerTitle: {
      ...typography.titleH3,
      color: theme.text,
      marginBottom: sizes.xs as number,
    },
    headerSubtitle: {
      ...typography.bodySm,
      color: theme.greyText,
    },
    card: {
      backgroundColor: isDark ? theme.card : theme.white,
      borderRadius: 24,
      padding: sizes.lg as number,
      marginBottom: sizes.lg as number,
      shadowColor: isDark ? "#000" : "#1f1f1f",
      shadowOpacity: isDark ? 0.45 : 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
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
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: sizes.sm as number,
      marginBottom: sizes.lg as number,
    },
    chip: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 999,
      paddingHorizontal: sizes.md as number,
      paddingVertical: sizes.xs as number,
      backgroundColor: isDark ? theme.backgroundSecond : theme.background,
    },
    chipActive: {
      borderColor: theme.primary,
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
    usefulnessList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: sizes.sm as number,
    },
    usefulnessChip: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 999,
      paddingHorizontal: sizes.md as number,
      paddingVertical: sizes.xs as number,
      backgroundColor: isDark ? theme.backgroundSecond : theme.backgroundLight,
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
    actions: {
      marginTop: sizes.lg as number,
      gap: sizes.sm as number,
    },
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: sizes.sm as number,
      padding: sizes.md as number,
      borderRadius: 18,
      backgroundColor: isDark ? "rgba(255,69,58,0.12)" : "rgba(255,69,58,0.1)",
      marginBottom: sizes.lg as number,
    },
    errorText: {
      ...typography.bodySm,
      color: theme.danger,
      flex: 1,
    },
    successContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: sizes.lg as number,
    },
    cardCentered: {
      backgroundColor: isDark ? theme.card : theme.white,
      borderRadius: 24,
      padding: sizes.lg as number,
      alignItems: "center",
      gap: sizes.sm as number,
    },
    completedTitle: {
      ...typography.titleH3,
      color: theme.text,
    },
    completedSubtitle: {
      ...typography.bodySm,
      color: theme.greyText,
      textAlign: "center",
      marginBottom: sizes.md as number,
    },
    completedActions: {
      width: "100%",
      gap: sizes.sm as number,
    },
  });

export const CreateBotTabScreen: React.FC = () => {
  const { theme, typography, sizes, isDark } = useTheme();
  const styles = useMemo(
    () => createStyles({ theme, typography, sizes, isDark }),
    [theme, typography, sizes, isDark],
  );

  const { aiBotStore } = useRootStore();
  const {
    form,
    creationError,
    isSubmitting,
    completed,
    createdBot,
    handleChange,
    resetFlow,
    getAiProfile,
  } = useCreateAiAgentPage();

  const [usefulnessDraft, setUsefulnessDraft] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    resetFlow();
    setUsefulnessDraft("");
    setValidationError(null);
  }, [resetFlow]);

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
    if (!value) {
      return;
    }
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

  const handleSubmit = useCallback(() => {
    const requiredFilled =
      form.firstName.trim() && form.lastName.trim() && form.profession.trim() && form.prompt.trim();

    if (!requiredFilled) {
      setValidationError("Заполните имя, фамилию, роль и системный промт агента.");
      return;
    }

    setValidationError(null);
    void aiBotStore.submitCreation();
  }, [aiBotStore, form.firstName, form.lastName, form.profession, form.prompt]);

  const handleResetForm = useCallback(() => {
    resetFlow();
    setUsefulnessDraft("");
    setValidationError(null);
  }, [resetFlow]);

  if (completed) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.successContent}>
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
                <Button title="Открыть профиль" onPress={() => getAiProfile(createdBot._id)} />
              ) : null}
              <Button title="Создать ещё" type="primary-outline" onPress={handleResetForm} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const showError = validationError || creationError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Создайте AI-агента</Text>
          <Text style={styles.headerSubtitle}>
            Заполните профиль, чтобы пользователи сразу понимали, чем полезен ваш ассистент.
          </Text>
        </View>

        {showError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={theme.danger} />
            <Text style={styles.errorText}>{validationError ?? creationError}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Основная информация</Text>
          <Text style={styles.sectionDescription}>
            Имя и роль помогут пользователям узнать агента и понять его экспертизу.
          </Text>

          <FormTextField
            label="Имя"
            value={form.firstName}
            onChangeText={(text) => handleChange("firstName", text)}
            placeholder="Введите имя"
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

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ценность для пользователя</Text>
          <Text style={styles.sectionDescription}>
            Выберите категории и опишите, чем агент поможет вашим пользователям.
          </Text>

          <View style={styles.chipsContainer}>
            {categoryOptions.map((category) => {
              const normalized = category.trim().toLowerCase();
              const isActive = form.categories.some(
                (item) => item.trim().toLowerCase() === normalized,
              );
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

          <View style={styles.usefulnessInputRow}>
            <FormTextField
              label=""
              value={usefulnessDraft}
              onChangeText={setUsefulnessDraft}
              placeholder="Добавьте пункт ценности"
              containerStyle={styles.usefulnessField}
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

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Голос и легенда</Text>
          <Text style={styles.sectionDescription}>
            Опишите стиль общения, историю агента и первое сообщение пользователю.
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

        <View style={styles.actions}>
          <Button
            title="Сохранить агента"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
          <Button
            title="Очистить форму"
            type="gray-outline"
            onPress={handleResetForm}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
