// src/screens/Library/components/FormHeader.tsx
import React, { memo, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "rn-vs-lb/theme";
import { useTranslation } from "react-i18next";

type Props = {
  title: string;
  subtitle: string;
  collapsed: boolean;
  hasResult: boolean;
  onPress: () => void;
};

export const FormHeader = memo(({ title, subtitle, collapsed, hasResult, onPress }: Props) => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();

  const s = useMemo(() => {
    const successBg = "#E9F7EF";
    const successBorder = "#BFE7D2";
    const successText = "#1E7A46";

    const neutralBg = theme.background;
    const neutralBorder = theme.border;
    const neutralText = theme.greyText;

    const pillBg = hasResult ? successBg : neutralBg;
    const pillBorder = hasResult ? successBorder : neutralBorder;
    const pillText = hasResult ? successText : neutralText;

    return StyleSheet.create({
      header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },

      left: {
        flex: 1,
        paddingRight: sizes.sm as number,
      },

      title: {
        ...typography.titleH4,
        color: theme.title,
      },

      subtitle: {
        ...typography.body,
        color: theme.greyText,
        marginTop: 2,
      },

      right: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: sizes.xs as number,
      },

      pill: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 6,
        paddingHorizontal: sizes.sm as number,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: pillBg,
        borderWidth: 1,
        borderColor: pillBorder,
      },

      pillText: {
        ...typography.body,
        color: pillText,
      },

      chevronBtn: {
        width: 38,
        height: 38,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.white,
        borderWidth: 1,
        borderColor: theme.border,
      },
    });
  }, [
    hasResult,
    sizes.sm,
    sizes.xs,
    theme.background,
    theme.border,
    theme.greyText,
    theme.title,
    theme.white,
    typography.body,
    typography.titleH4,
  ]);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={s.header}>
      <View style={s.left}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={s.right}>
        <View style={s.pill}>
          {hasResult ? (
            <MaterialIcons name="check-circle" size={16} color="#1E7A46" />
          ) : (
            <MaterialIcons name="edit" size={16} color={theme.greyText} />
          )}
          <Text style={s.pillText}>
            {hasResult ? t("library.form.status.filled") : t("library.form.status.fill")}
          </Text>
        </View>

        <View style={s.chevronBtn}>
          <MaterialIcons
            name={collapsed ? "keyboard-arrow-down" : "keyboard-arrow-up"}
            size={22}
            color={theme.greyText}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
});

FormHeader.displayName = "FormHeader";
