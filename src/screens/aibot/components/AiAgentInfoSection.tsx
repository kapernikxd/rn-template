import React, { memo } from "react";
import { Text, View } from "react-native";
import { Spacer } from "rn-vs-lb";
import { useTranslation } from "react-i18next";

import { AiAgentStyles } from "../styles";

type AiAgentInfoSectionProps = {
  styles: AiAgentStyles;
  intro: string;
  usefulness: string[];
  creatorName: string;
  createdAt: string;
};

export const AiAgentInfoSection = memo(
  ({ styles, intro, usefulness, creatorName, createdAt }: AiAgentInfoSectionProps) => {
    const { t } = useTranslation();

    return (
      <View style={styles.sectionsWrapper}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('screens.aibot.info.introTitle')}</Text>
          {intro ? (
            <Text style={styles.sectionText}>{intro}</Text>
          ) : (
            <Text style={styles.sectionPlaceholder}>{t('screens.aibot.info.introPlaceholder')}</Text>
          )}
        </View>

        <Spacer size="md" />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('screens.aibot.info.usefulnessTitle')}</Text>
          {usefulness.length ? (
            <View style={styles.pillList}>
              {usefulness.map((item) => (
                <View key={item} style={styles.pill}>
                  <Text style={styles.pillText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.sectionPlaceholder}>{t('screens.aibot.info.usefulnessPlaceholder')}</Text>
          )}
        </View>

        <Spacer size="md" />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('screens.aibot.info.creatorTitle')}</Text>
          <View style={styles.highlightList}>
            <View style={[styles.highlightRow, styles.highlightRowSpacer]}>
              <Text style={styles.highlightLabel}>{t('screens.aibot.info.creatorLabel')}</Text>
              <Text style={styles.highlightValue} numberOfLines={1} ellipsizeMode="tail">
                {creatorName}
              </Text>
            </View>
            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>{t('screens.aibot.info.createdAtLabel')}</Text>
              <Text style={styles.highlightValue} numberOfLines={1} ellipsizeMode="tail">
                {createdAt}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  },
);

AiAgentInfoSection.displayName = "AiAgentInfoSection";
