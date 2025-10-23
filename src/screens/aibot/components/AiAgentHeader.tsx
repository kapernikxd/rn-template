import React, { memo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { ThemeType } from "rn-vs-lb/theme";

import { AiAgentStyles } from "../styles";

type AiAgentHeaderProps = {
  styles: AiAgentStyles;
  theme: ThemeType;
  onBack: () => void;
  onShare: () => void;
  onMore: () => void;
};

export const AiAgentHeader = memo(
  ({ styles, theme, onBack, onShare, onMore }: AiAgentHeaderProps) => (
    <View style={styles.headerActions}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onBack}
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={22} color={theme.title} />
      </TouchableOpacity>
      <View style={styles.headerRightActions}>
        <TouchableOpacity
          style={[styles.iconButton, styles.iconButtonSecondary]}
          onPress={onShare}
          accessibilityRole="button"
        >
          <Feather name="share-2" size={20} color={theme.title} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, styles.iconButtonSecondary]}
          onPress={onMore}
          accessibilityRole="button"
        >
          <Feather name="more-horizontal" size={20} color={theme.title} />
        </TouchableOpacity>
      </View>
    </View>
  ),
);

AiAgentHeader.displayName = "AiAgentHeader";
