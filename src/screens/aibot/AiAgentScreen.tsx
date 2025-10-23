import React, { useCallback, useEffect, useMemo } from "react";
import { Alert, ScrollView, Share, View, useWindowDimensions } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "rn-vs-lb/theme";

import { ROUTES, RootStackParamList } from "../../navigation/types";
import { useAiAgentProfile } from "../../helpers/hooks/aiAgent/useAiAgentProfile";
import { getUserAvatar, getUserFullName } from "../../helpers/utils/user";
import { ScreenLoader } from "../../components";
import { useSafeAreaColors } from "../../store/SafeAreaColorProvider";
import {
  AiAgentGallery,
  AiAgentHeader,
  AiAgentHeroCard,
  AiAgentInfoSection,
  AiAgentTabBar,
} from "./components";
import { createAiAgentStyles } from "./styles";


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
    () => createAiAgentStyles({ theme, sizes, typography, isDark }),
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
  const creatorName = useMemo(
    () => (creator ? getUserFullName(creator as any) : "—"),
    [creator],
  );

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
    // <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AiAgentHeader
            styles={styles}
            theme={theme}
            onBack={onBack}
            onShare={handleShare}
            onMore={handleMore}
          />
          <AiAgentHeroCard
            styles={styles}
            theme={theme}
            avatarUri={avatarUri}
            displayName={displayName}
            profession={profession}
            intro={intro}
            categories={categories}
            followButtonTitle={followButtonTitle}
            onToggleFollow={handleToggleFollow}
            isFollowUpdating={isFollowUpdating}
            disableFollowAction={disableFollowAction}
            onStartChat={handleStartChat}
            isChatLoading={isChatLoading}
            aiBotId={aiBotId}
            isFollowing={isFollowing}
          />
        </View>

        <AiAgentTabBar
          styles={styles}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "info" ? (
          <AiAgentInfoSection
            styles={styles}
            intro={intro}
            usefulness={usefulness}
            creatorName={creatorName}
            createdAt={createdAt ?? "—"}
          />
        ) : (
          <AiAgentGallery
            styles={styles}
            isLoading={botDetailsLoading}
            photos={botPhotos}
            galleryColumns={galleryColumns}
            galleryItemSize={galleryItemSize}
          />
        )}
      </ScrollView>
    // </SafeAreaView>
  );
};

