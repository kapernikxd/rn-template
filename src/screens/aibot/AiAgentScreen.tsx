import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Spacer } from "rn-vs-lb";
import { useTheme, ThemeType, SizesType, TypographytType } from "rn-vs-lb/theme";

import { ROUTES, RootStackParamList } from "../../navigation/types";
import { useAiAgentProfile } from "../../helpers/hooks/aiAgent/useAiAgentProfile";
import { getUserAvatar, getUserFullName } from "../../helpers/utils/user";
import { ScreenLoader } from "../../components";
import { useSafeAreaColors } from "../../store/SafeAreaColorProvider";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.AiAgent>;

const GALLERY_COLUMNS_SMALL = 2;
const GALLERY_COLUMNS_DEFAULT = 3;

export const AiAgentScreen = ({ route }: Props) => {
  const aiBotId = route.params?.aiBotId;
  const {
    aiBot,
    botDetails,
    botPhotos,
    botDetailsLoading,
    activeTab,
    setActiveTab,
    isLoading,
    isFollowUpdating,
    isChatLoading,
    isFollowing,
    disableFollowAction,
    onBack,
    handleToggleFollow,
    handleStartChat,
  } = useAiAgentProfile(aiBotId);

  const { theme, sizes, typography, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { setColors } = useSafeAreaColors();

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.background,
      contentColor: theme.background,
    });
  }, [setColors, theme.background]);

  const styles = useMemo(
    () => createStyles({ theme, sizes, typography, isDark }),
    [theme, sizes, typography, isDark],
  );

  const avatarUri = useMemo(() => getUserAvatar((aiBot as any) ?? {}), [aiBot]);
  const displayName = useMemo(() => getUserFullName((aiBot as any) ?? {}), [aiBot]);
  const profession = aiBot?.profession ?? "";
  const intro = botDetails?.intro ?? aiBot?.intro ?? aiBot?.userBio ?? "";
  const categories = botDetails?.categories ?? aiBot?.categories ?? [];
  const usefulness = botDetails?.usefulness ?? aiBot?.usefulness ?? [];
  const creator = botDetails?.createdBy ?? aiBot?.createdBy;
  const createdAt = aiBot?.createdAt;

  const galleryColumns = width < 380 ? GALLERY_COLUMNS_SMALL : GALLERY_COLUMNS_DEFAULT;
  const gallerySpacing = sizes.sm as number;
  const horizontalPadding = (sizes.lg as number) * 2;
  const galleryItemSize = useMemo(() => {
    const availableWidth = width - horizontalPadding - gallerySpacing * (galleryColumns - 1);
    return Math.max(80, availableWidth / galleryColumns);
  }, [galleryColumns, gallerySpacing, horizontalPadding, width]);

  const handleShare = useCallback(async () => {
    if (!aiBot) return;
    try {
      await Share.share({
        message: `${displayName}\n${profession}`.trim(),
      });
    } catch (error) {
      console.error("Failed to share AI agent", error);
    }
  }, [aiBot, displayName, profession]);

  const handleMore = useCallback(() => {
    Alert.alert("Скоро", "Дополнительные действия появятся позже.");
  }, []);

  const followButtonTitle = isFollowing ? "Отписаться" : "Подписаться";

  if (isLoading && !aiBot) {
    return <ScreenLoader />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={onBack} accessibilityRole="button">
              <Ionicons name="chevron-back" size={22} color={theme.title} />
            </TouchableOpacity>
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={[styles.iconButton, styles.iconButtonSecondary]}
                onPress={handleShare}
                accessibilityRole="button"
              >
                <Feather name="share-2" size={20} color={theme.title} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.iconButtonSecondary]}
                onPress={handleMore}
                accessibilityRole="button"
              >
                <Feather name="more-horizontal" size={20} color={theme.title} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              <View style={styles.heroInfo}>
                <View style={styles.badge}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={theme.primary} />
                  <Text style={styles.badgeText}>AI-агент</Text>
                </View>
                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                  {displayName}
                </Text>
                {!!profession && (
                  <Text style={styles.profession} numberOfLines={2} ellipsizeMode="tail">
                    {profession}
                  </Text>
                )}
              </View>
            </View>

            {!!intro && (
              <Text style={styles.description} numberOfLines={4} ellipsizeMode="tail">
                {intro}
              </Text>
            )}

            {!!categories.length && (
              <View style={styles.tagsContainer}>
                {categories.map((item) => (
                  <View key={item} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.buttonsRow}>
              <View style={styles.buttonWrapper}>
                <Button
                  title={followButtonTitle}
                  onPress={handleToggleFollow}
                  loading={isFollowUpdating}
                  disabled={disableFollowAction}
                  type={isFollowing ? "gray-outline" : "primary"}
                />
              </View>
              <View style={[styles.buttonWrapper, styles.buttonWrapperLast]}>
                <Button
                  title="Перейти к чату"
                  onPress={handleStartChat}
                  loading={isChatLoading}
                  type="primary-outline"
                  disabled={!aiBotId || isChatLoading}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "info" && styles.tabButtonActive]}
            onPress={() => setActiveTab("info")}
          >
            <Text
              style={[styles.tabLabel, activeTab === "info" && styles.tabLabelActive]}
            >
              Информация
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "gallery" && styles.tabButtonActive]}
            onPress={() => setActiveTab("gallery")}
          >
            <Text
              style={[styles.tabLabel, activeTab === "gallery" && styles.tabLabelActive]}
            >
              Галерея
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "info" ? (
          <View style={styles.sectionsWrapper}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Знакомство</Text>
              {intro ? (
                <Text style={styles.sectionText}>{intro}</Text>
              ) : (
                <Text style={styles.sectionPlaceholder}>Создатель еще не добавил описание.</Text>
              )}
            </View>

            <Spacer size="md" />

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Чем будет полезно</Text>
              {usefulness.length ? (
                <View style={styles.pillList}>
                  {usefulness.map((item) => (
                    <View key={item} style={styles.pill}>
                      <Text style={styles.pillText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.sectionPlaceholder}>Полезность пока не заполнена.</Text>
              )}
            </View>

            <Spacer size="md" />

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Информация о создателе</Text>
              <View style={styles.highlightList}>
                <View style={[styles.highlightRow, styles.highlightRowSpacer]}>
                  <Text style={styles.highlightLabel}>Создатель</Text>
                  <Text style={styles.highlightValue} numberOfLines={1} ellipsizeMode="tail">
                    {creator ? getUserFullName(creator as any) : "—"}
                  </Text>
                </View>
                <View style={styles.highlightRow}>
                  <Text style={styles.highlightLabel}>Создан</Text>
                  <Text style={styles.highlightValue} numberOfLines={1} ellipsizeMode="tail">
                    {createdAt ?? "—"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.galleryWrapper}>
            {botDetailsLoading ? (
              <ActivityIndicator />
            ) : botPhotos.length ? (
              <View style={styles.galleryGrid}>
                {botPhotos.map((photo, index) => {
                  const isLastInRow = (index + 1) % galleryColumns === 0;
                  return (
                    <Image
                      key={`${photo}-${index}`}
                      source={{ uri: photo }}
                      style={[
                        styles.galleryImage,
                        isLastInRow && styles.galleryImageLast,
                        { width: galleryItemSize, height: galleryItemSize },
                      ]}
                    />
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Создатель еще не добавил фото.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = ({
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
    },
    header: {
      paddingHorizontal: sizes.lg as number,
      paddingTop: (sizes.xl as number) + 12,
      paddingBottom: sizes.lg as number,
      backgroundColor: isDark ? theme.backgroundSecond : theme.backgroundLight,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
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
      padding: sizes.lg as number,
      backgroundColor: isDark ? theme.card : theme.white,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.25 : 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 84,
      height: 84,
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
      backgroundColor: isDark ? "rgba(158,95,211,0.18)" : "rgba(111,45,168,0.12)",
      paddingHorizontal: sizes.sm as number,
      paddingVertical: 6,
      marginBottom: sizes.xs as number,
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
      flexDirection: "row",
      marginTop: sizes.lg as number,
    },
    buttonWrapper: {
      flex: 1,
      marginRight: sizes.sm as number,
    },
    buttonWrapperLast: {
      marginRight: 0,
      marginLeft: sizes.sm as number,
    },
    tabBar: {
      flexDirection: "row",
      marginHorizontal: sizes.lg as number,
      marginTop: sizes.lg as number,
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
      paddingHorizontal: sizes.lg as number,
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
      paddingHorizontal: sizes.lg as number,
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

