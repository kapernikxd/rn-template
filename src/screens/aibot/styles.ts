import { StyleSheet } from "react-native";
import { ThemeType, SizesType, TypographytType } from "rn-vs-lb/theme";

export type AiAgentStyles = ReturnType<typeof createAiAgentStyles>;

export const createAiAgentStyles = ({
  theme,
  sizes,
  typography,
  isDark,
}: {
  theme: ThemeType;
  sizes: SizesType;
  typography: TypographytType;
  isDark: boolean;
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingBottom: sizes.xl as number,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: sizes.xs as number,
      paddingBottom: sizes.lg as number,
    },
    headerActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: sizes.lg as number,
    },
    headerRightActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    },
    iconButtonSecondary: {
      marginLeft: 8,
    },
    heroCard: {
      borderRadius: 28,
      padding: sizes.xs as number,
      backgroundColor: isDark ? theme.background : theme.card,
      // shadowColor: "#000",
      // shadowOpacity: isDark ? 0.25 : 0.1,
      // shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 94,
      height: 94,
      borderRadius: 26,
      marginRight: sizes.md as number,
    },
    heroInfo: {
      flex: 1,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      borderRadius: 999,
      // backgroundColor: isDark ? "rgba(158,95,211,0.18)" : "rgba(111,45,168,0.12)",
      // paddingHorizontal: sizes.sm as number,
      paddingVertical: 6,
      // marginBottom: sizes.xs as number,
    },
    badgeText: {
      marginLeft: 6,
      color: theme.primary,
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    name: {
      ...(typography.titleH4 as object),
      color: theme.title,
      marginBottom: 4,
    },
    profession: {
      ...(typography.body as object),
      color: theme.greyText,
    },
    description: {
      ...(typography.body as object),
      color: theme.text,
      marginTop: sizes.md as number,
      lineHeight: 22,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: sizes.md as number,
    },
    tag: {
      paddingHorizontal: sizes.md as number,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : theme.backgroundSecond,
      marginRight: sizes.sm as number,
      marginBottom: sizes.sm as number,
    },
    tagText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.title,
    },
    buttonsRow: {
      display: "flex",
      gap: 8,
      flexDirection: "column"
    },
    buttonWrapper: {
      flex: 1,
    },
    buttonWrapperLast: {
    },
    tabBar: {
      flexDirection: "row",
      marginHorizontal: sizes.xxs as number,
      // marginTop: sizes.lg as number,
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : theme.backgroundSecond,
      borderRadius: 18,
      padding: 4,
    },
    tabButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 14,
    },
    tabButtonActive: {
      backgroundColor: isDark ? theme.card : theme.white,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    tabLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.greyText,
    },
    tabLabelActive: {
      color: theme.title,
    },
    sectionsWrapper: {
      paddingHorizontal: sizes.xs as number,
      paddingVertical: sizes.lg as number,
    },
    sectionCard: {
      borderRadius: 24,
      padding: sizes.lg as number,
      backgroundColor: isDark ? theme.card : theme.white,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.18 : 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    sectionTitle: {
      ...(typography.titleH5 as object),
      color: theme.title,
      marginBottom: sizes.sm as number,
    },
    sectionText: {
      ...(typography.body as object),
      color: theme.text,
      lineHeight: 22,
    },
    sectionPlaceholder: {
      ...(typography.bodySm as object),
      color: theme.greyText,
    },
    pillList: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    pill: {
      paddingHorizontal: sizes.md as number,
      paddingVertical: 8,
      borderRadius: 14,
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : theme.backgroundSecond,
      marginRight: sizes.sm as number,
      marginBottom: sizes.sm as number,
    },
    pillText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.title,
    },
    highlightList: {
      marginTop: sizes.sm as number,
    },
    highlightRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    highlightRowSpacer: {
      marginBottom: sizes.sm as number,
    },
    highlightLabel: {
      ...(typography.bodySm as object),
      color: theme.greyText,
    },
    highlightValue: {
      ...(typography.bodySm as object),
      color: theme.title,
      fontWeight: "600",
      flexShrink: 1,
      textAlign: "right",
      marginLeft: sizes.sm as number,
    },
    galleryWrapper: {
      paddingHorizontal: sizes.md as number,
      paddingVertical: sizes.xl as number,
    },
    galleryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    galleryImage: {
      borderRadius: 18,
      backgroundColor: theme.backgroundSecond,
      marginRight: sizes.sm as number,
      marginBottom: sizes.sm as number,
    },
    galleryImageLast: {
      marginRight: 0,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: sizes.lg as number,
    },
    emptyText: {
      ...(typography.bodySm as object),
      color: theme.greyText,
      textAlign: "center",
    },
  });

