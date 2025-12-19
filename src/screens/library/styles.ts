// src/screens/Library/styles.ts
import { StyleSheet } from "react-native";

export const makeStyles = ({ theme, typography, sizes }: any) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme.background,
      paddingHorizontal: sizes.xs as number,
      paddingVertical: sizes.md as number,
    },
    title: {
      ...typography.titleH3,
      color: theme.title,
      marginBottom: sizes.xs as number,
      textAlign: "center",
    },
    description: {
      ...typography.body,
      color: theme.greyText,
      marginBottom: sizes.lg as number,
      textAlign: "center",
    },
    formRow: {
      flexDirection: "row",
      columnGap: sizes.sm as number,
      marginBottom: sizes.sm as number,
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: sizes.sm as number,
      borderRadius: 14,
      alignItems: "center",
      marginTop: sizes.sm as number,
    },
    buttonText: {
      ...typography.button,
      color: theme.white,
    },
    copyButton: {
      backgroundColor: theme.white,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    copyButtonText: {
      color: theme.primary,
    },
    errorText: {
      color: theme.danger,
      ...typography.body,
      marginTop: sizes.xs as number,
    },
    copyMessage: {
      ...typography.body,
      color: theme.primary,
      marginTop: sizes.xs as number,
      textAlign: "center",
    },
    chartWrapper: {
      backgroundColor: theme.white,
      borderRadius: 16,
      padding: sizes.md as number,
      marginTop: sizes.lg as number,
    },
    sectionTitle: {
      ...typography.titleH4,
      color: theme.title,
      marginTop: sizes.md as number,
      marginBottom: sizes.xs as number,
    },
    smallAction: {
      marginTop: sizes.sm as number,
      alignSelf: "center",
    },
    smallActionText: {
      ...typography.body,
      color: theme.primary,
    },
  });
