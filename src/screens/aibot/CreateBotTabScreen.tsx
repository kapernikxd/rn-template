import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "rn-vs-lb";
import { ThemeType, useTheme } from "rn-vs-lb/theme";

const ASSISTANT_KINDS = [
  {
    id: "support",
    title: "Саппорт",
    description: "Отвечает на вопросы клиентов и помогает быстрее закрывать обращения.",
  },
  {
    id: "sales",
    title: "Продажи",
    description: "Собирает лиды, подбирает оффер и доводит клиента до оплаты.",
  },
  {
    id: "expert",
    title: "Эксперт",
    description: "Делится знаниями и обучает сотрудников или пользователей продукту.",
  },
];

const TONE_OPTIONS = [
  "Дружелюбный",
  "Профессиональный",
  "Энергичный",
  "Ироничный",
];

type StyleParams = {
  theme: ThemeType;
};

const createStyles = ({ theme }: StyleParams) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      paddingVertical: 24,
      paddingHorizontal: 20,
      gap: 20,
    },
    header: {
      gap: 8,
    },
    title: {
      color: theme.title,
    },
    subtitle: {
      color: theme.text,
      lineHeight: 20,
    },
    card: {
      backgroundColor: theme.white,
      borderRadius: 18,
      padding: 20,
      gap: 16,
      shadowColor: "#101828",
      shadowOpacity: 0.06,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 4,
    },
    cardTitle: {
      color: theme.title,
    },
    cardDescription: {
      color: theme.text,
      lineHeight: 18,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    chip: {
      borderWidth: 1,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    chipText: {},
    chipActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + "14",
    },
    chipInactive: {
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    chipTextActive: {
      color: theme.primary,
      fontWeight: "600",
    },
    chipTextInactive: {
      color: theme.text,
    },
    chipDescription: {
      color: theme.description,
      lineHeight: 18,
    },
    field: {
      gap: 8,
    },
    label: {
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: theme.greyText,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.white,
      minHeight: 48,
    },
    helper: {
      color: theme.description,
      lineHeight: 18,
    },
    textarea: {
      minHeight: 120,
      textAlignVertical: "top",
    },
    submitButton: {
      marginTop: 4,
    },
  });

export const CreateBotTabScreen: React.FC = () => {
  const { theme, typography } = useTheme();
  const styles = useMemo(() => createStyles({ theme }), [theme]);

  const [botName, setBotName] = useState("");
  const [botGoal, setBotGoal] = useState("");
  const [voiceTone, setVoiceTone] = useState(TONE_OPTIONS[0]);
  const [selectedKind, setSelectedKind] = useState<string>(ASSISTANT_KINDS[0]?.id ?? "support");

  const handleSubmit = () => {
    if (!botName.trim() || !botGoal.trim()) {
      Alert.alert("Заполните поля", "Добавьте название и задачу агента, чтобы продолжить.");
      return;
    }

    Alert.alert(
      "Черновик сохранён",
      `Бот «${botName.trim()}» создан в режиме ${voiceTone.toLowerCase()} голоса. Выберите сценарии и запустите его в работу.`,
    );

    setBotName("");
    setBotGoal("");
    setVoiceTone(TONE_OPTIONS[0]);
    setSelectedKind(ASSISTANT_KINDS[0]?.id ?? "support");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[typography.titleH2, styles.title]}>Создайте AI-агента</Text>
          <Text style={[typography.body, styles.subtitle]}>
            Подберите роль, голос и задачи — агент будет готов ответить на вопросы клиентов и выполнять сценарии
            автоматически.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[typography.titleH4, styles.cardTitle]}>Роль агента</Text>
          <Text style={[typography.bodySm, styles.cardDescription]}>
            Выберите базовый пресет. Его всегда можно расширить индивидуальными сценариями и знаниями.
          </Text>

          <View style={styles.chipRow}>
            {ASSISTANT_KINDS.map((item) => {
              const active = selectedKind === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                  onPress={() => setSelectedKind(item.id)}
                >
                  <Text
                    style={[
                      typography.bodySm,
                      styles.chipText,
                      active ? styles.chipTextActive : styles.chipTextInactive,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[typography.bodySm, styles.chipDescription]}>
            {ASSISTANT_KINDS.find((item) => item.id === selectedKind)?.description}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[typography.titleH4, styles.cardTitle]}>Основные настройки</Text>

          <View style={styles.field}>
            <Text style={[typography.bodyXs, styles.label]}>Название</Text>
            <TextInput
              style={[styles.input, typography.body]}
              value={botName}
              placeholder="Например, Виртуальный ассистент"
              placeholderTextColor={theme.placeholder}
              onChangeText={setBotName}
            />
          </View>

          <View style={styles.field}>
            <Text style={[typography.bodyXs, styles.label]}>Тон общения</Text>
            <View style={styles.chipRow}>
              {TONE_OPTIONS.map((tone) => {
                const active = tone === voiceTone;
                return (
                  <TouchableOpacity
                    key={tone}
                    style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                    onPress={() => setVoiceTone(tone)}
                  >
                    <Text
                      style={[
                        typography.bodySm,
                        styles.chipText,
                        active ? styles.chipTextActive : styles.chipTextInactive,
                      ]}
                    >
                      {tone}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[typography.bodyXs, styles.label]}>Главная задача</Text>
            <TextInput
              multiline
              style={[styles.input, styles.textarea, typography.body]}
              value={botGoal}
              onChangeText={setBotGoal}
              placeholder="Опишите ключевую задачу бота и ожидаемый результат"
              placeholderTextColor={theme.placeholder}
            />
            <Text style={[typography.bodySm, styles.helper]}>
              Например: «Отвечай на вопросы о тарифах и помогай подобрать лучший план для бизнеса».
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.submitButton]}>
          <Text style={[typography.titleH4, styles.cardTitle]}>Запуск</Text>
          <Text style={[typography.bodySm, styles.cardDescription]}>
            Проверьте настройки и сохраните агента. После сохранения откроется конструктор сценариев и база знаний.
          </Text>
          <Button title="Создать агента" onPress={handleSubmit} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
