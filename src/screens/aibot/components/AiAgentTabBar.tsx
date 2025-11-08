import React, { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AiAgentStyles } from "../styles";

type AiAgentTab = "info" | "gallery";

type AiAgentTabBarProps = {
  styles: AiAgentStyles;
  activeTab: AiAgentTab;
  onChange: (tab: AiAgentTab) => void;
};

export const AiAgentTabBar = memo(({ styles, activeTab, onChange }: AiAgentTabBarProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "info" && styles.tabButtonActive]}
        onPress={() => onChange("info")}
      >
        <Text style={[styles.tabLabel, activeTab === "info" && styles.tabLabelActive]}>
          {t('screens.aibot.tabs.info')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "gallery" && styles.tabButtonActive]}
        onPress={() => onChange("gallery")}
      >
        <Text style={[styles.tabLabel, activeTab === "gallery" && styles.tabLabelActive]}>
          {t('screens.aibot.tabs.gallery')}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

AiAgentTabBar.displayName = "AiAgentTabBar";
