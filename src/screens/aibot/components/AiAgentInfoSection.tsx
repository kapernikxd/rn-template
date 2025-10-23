import React, { memo } from "react";
import { Text, View } from "react-native";
import { Spacer } from "rn-vs-lb";

import { AiAgentStyles } from "../styles";

type AiAgentInfoSectionProps = {
  styles: AiAgentStyles;
  intro: string;
  usefulness: string[];
  creatorName: string;
  createdAt: string;
};

const INTRO_PLACEHOLDER = "Создатель еще не добавил описание.";
const USEFULNESS_PLACEHOLDER = "Полезность пока не заполнена.";

export const AiAgentInfoSection = memo(
  ({ styles, intro, usefulness, creatorName, createdAt }: AiAgentInfoSectionProps) => (
    <View style={styles.sectionsWrapper}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Знакомство</Text>
        {intro ? (
          <Text style={styles.sectionText}>{intro}</Text>
        ) : (
          <Text style={styles.sectionPlaceholder}>{INTRO_PLACEHOLDER}</Text>
        )}
      </View>

      <Spacer size="md" />

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Чем будет полезно</Text>
        {usefulness.length ? (
          <View style={styles.pillList}>
            {usefulness.map((item) => (
              <View key={item} style={styles.pill}>
                <Text style={styles.pillText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.sectionPlaceholder}>{USEFULNESS_PLACEHOLDER}</Text>
        )}
      </View>

      <Spacer size="md" />

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Информация о создателе</Text>
        <View style={styles.highlightList}>
          <View style={[styles.highlightRow, styles.highlightRowSpacer]}>
            <Text style={styles.highlightLabel}>Создатель</Text>
            <Text style={styles.highlightValue} numberOfLines={1} ellipsizeMode="tail">
              {creatorName}
            </Text>
          </View>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightLabel}>Создан</Text>
            <Text style={styles.highlightValue} numberOfLines={1} ellipsizeMode="tail">
              {createdAt}
            </Text>
          </View>
        </View>
      </View>
    </View>
  ),
);

AiAgentInfoSection.displayName = "AiAgentInfoSection";
