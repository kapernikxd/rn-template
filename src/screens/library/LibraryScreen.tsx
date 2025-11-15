import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "rn-vs-lb/theme";
import { useTranslation } from "react-i18next";

export const LibraryScreen = () => {
  const { theme, typography, sizes } = useTheme();
  const { t } = useTranslation();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.background,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: sizes.lg as number,
        },
        title: {
          ...typography.titleH3,
          color: theme.title,
          textAlign: "center",
          marginBottom: sizes.sm as number,
        },
        description: {
          ...typography.body,
          color: theme.greyText,
          textAlign: "center",
        },
      }),
    [sizes.lg, sizes.sm, theme.background, theme.greyText, theme.title, typography.body, typography.titleH3],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("screens.library.title")}</Text>
      <Text style={styles.description}>{t("screens.library.empty")}</Text>
    </View>
  );
};

export default LibraryScreen;
