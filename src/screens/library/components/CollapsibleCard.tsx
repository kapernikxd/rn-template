// src/screens/Library/components/CollapsibleCard.tsx
import React, { memo, useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "rn-vs-lb/theme";

type Props = {
  style?: StyleProp<ViewStyle>;
  header: React.ReactNode;
  collapsed: boolean;
  children: React.ReactNode;
  collapsedFooter?: React.ReactNode;
};

export const CollapsibleCard = memo(({ style, header, collapsed, children, collapsedFooter }: Props) => {
  const { theme, sizes } = useTheme();

  const s = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.white,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          padding: sizes.md as number,
        },
        body: {
          marginTop: sizes.md as number,
        },
      }),
    [sizes.md, theme.border, theme.white],
  );

  return (
    <View style={[s.card, style]}>
      {header}
      {!collapsed ? <View style={s.body}>{children}</View> : collapsedFooter ?? null}
    </View>
  );
});
CollapsibleCard.displayName = "CollapsibleCard";
