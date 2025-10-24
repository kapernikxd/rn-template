import React, { memo } from "react";
import { View } from "react-native";
import { ThemeType } from "rn-vs-lb/theme";
import { ThreeDotsMenu } from "rn-vs-lb";

import { AiAgentStyles } from "../styles";
import { BackButton, ShareIconButton } from "../../../components/buttons";

type AiAgentHeaderProps = {
  styles: AiAgentStyles;
  theme: ThemeType;
  onBack: () => void;
  onShare: () => void;
  items: any;
}

export const AiAgentHeader = memo(
  ({ styles, theme, onBack, onShare, items }: AiAgentHeaderProps) => (
    <View style={styles.headerActions}>
      <BackButton onPress={onBack} style={styles.iconButton} iconColor={theme.title} />
      <View style={styles.headerRightActions}>
        <ShareIconButton
          onPress={onShare}
          style={[styles.iconButton, styles.iconButtonSecondary]}
          iconColor={theme.title}
        />
        <ThreeDotsMenu
          positionLeft={210}
          positionTop={10}
          iconColor={theme.black}
          style={[styles.iconButton, styles.iconButtonSecondary]}
          items={items}
        />
      </View>
    </View>
  ),
);

AiAgentHeader.displayName = "AiAgentHeader";
