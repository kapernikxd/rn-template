import React from "react";
import { StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "rn-vs-lb/theme";

type ShareIconButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  backgroundColor?: string;
  iconSize?: number;
  size?: number;
};

const DEFAULT_SIZE = 44;
const DEFAULT_ICON_SIZE = 20;

export const ShareIconButton: React.FC<ShareIconButtonProps> = ({
  onPress,
  accessibilityLabel = "Поделиться",
  style,
  iconColor,
  backgroundColor,
  iconSize = DEFAULT_ICON_SIZE,
  size = DEFAULT_SIZE,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: 16,
          backgroundColor: backgroundColor ?? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
        },
        style,
      ]}
    >
      <Feather name="share-2" size={iconSize} color={iconColor ?? theme.title} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ShareIconButton;
