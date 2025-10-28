import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, RefreshControl, ScrollView, Share, View, useWindowDimensions } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "rn-vs-lb/theme";
import { ModalProfilePhoto, ReportModal, Spacer } from "rn-vs-lb";

import { ROUTES, RootStackParamList } from "../../navigation/types";
import { useAiAgentProfile } from "../../helpers/hooks/aiAgent/useAiAgentProfile";
import { getUserAvatar, getUserFullName } from "../../helpers/utils/user";
import { getSmartTime } from "../../helpers/utils/date";
import { ScreenLoader } from "../../components";
import { GuestAiChatModal } from "../../components/aibot/GuestAiChatModal";
import { useSafeAreaColors } from "../../store/SafeAreaColorProvider";
import { useRootStore } from "../../store/StoreProvider";
import { usePortalNavigation } from "../../helpers/hooks";
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
    canEdit,
    isAuthenticated,
    handleAiAgentDeleted: handleAiAgentDeletedBase,
  } = useAiAgentProfile(aiBotId);
  const { goToAiBotEdit } = usePortalNavigation();

  const { theme, sizes, typography, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { setColors } = useSafeAreaColors();
  const { profileStore, aiBotStore } = useRootStore();

  const [isReportVisible, setIsReportVisible] = useState(false);
  const [isGuestChatVisible, setIsGuestChatVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAvatarPreviewVisible, setIsAvatarPreviewVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setColors({
      topColor: theme.background,
      bottomColor: theme.background,
    });
  }, [setColors, theme.background]);

  const styles = useMemo(
    () => createAiAgentStyles({ theme, sizes, typography, isDark }),
    [theme, sizes, typography, isDark],
  );

  const avatarUri = useMemo(() => getUserAvatar((aiBot as any) ?? {}) ?? "", [aiBot]);
  const displayName = useMemo(() => getUserFullName((aiBot as any) ?? {}), [aiBot]);
  const profession = aiBot?.profession ?? "";
  const intro = botDetails?.intro ?? aiBot?.intro ?? aiBot?.userBio ?? "";
  const categories = botDetails?.categories ?? aiBot?.categories ?? [];
  const usefulness = botDetails?.usefulness ?? aiBot?.usefulness ?? [];
  const creator = botDetails?.createdBy ?? aiBot?.createdBy;
  const createdAt = aiBot?.createdAt;
  const formattedCreatedAt = useMemo(() => {
    if (!createdAt) {
      return "—";
    }

    return getSmartTime(createdAt) ?? "—";
  }, [createdAt]);
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

  const handleEdit = useCallback(() => {
    if (canEdit && aiBotId) {
      goToAiBotEdit(aiBotId)
    }
  }, [aiBotId, canEdit, goToAiBotEdit]);

  const handleOpenAvatarPreview = useCallback(() => {
    if (avatarUri) {
      setIsAvatarPreviewVisible(true);
    }
  }, [avatarUri]);

  const handleCloseAvatarPreview = useCallback(() => {
    setIsAvatarPreviewVisible(false);
  }, []);
  const noop = useCallback(() => {}, []);

  useEffect(() => {
    if (!avatarUri && isAvatarPreviewVisible) {
      setIsAvatarPreviewVisible(false);
    }
  }, [avatarUri, isAvatarPreviewVisible]);

  const handleDeleteBot = useCallback(async () => {
    if (!aiBotId || isDeleting) {
      return;
    }
    setIsDeleting(true);
    let isDeleted = false;
    try {
      await aiBotStore.deleteBot(aiBotId);
      isDeleted = true;
    } catch (error) {
      console.error("Failed to delete AI agent", error);
    } finally {
      setIsDeleting(false);
    }

    if (isDeleted) {
      handleAiAgentDeletedBase();
    }
  }, [aiBotId, aiBotStore, handleAiAgentDeletedBase, isDeleting]);

  const handleDeletePress = useCallback(() => {
    if (!aiBotId || isDeleting) {
      return;
    }

    Alert.alert(
      "Удалить AI-бота",
      "Вы уверены, что хотите удалить этого AI-бота? Это действие нельзя отменить.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            void handleDeleteBot();
          },
        },
      ],
      { cancelable: true },
    );
  }, [aiBotId, handleDeleteBot, isDeleting]);

  const handleStartChatPress = useCallback(() => {
    if (isAuthenticated) {
      handleStartChat();
      return;
    }

    if (aiBotId) {
      setIsGuestChatVisible(true);
    }
  }, [aiBotId, handleStartChat, isAuthenticated]);

  const handleOpenReport = useCallback(() => setIsReportVisible(true), []);
  const handleCloseReport = useCallback(() => setIsReportVisible(false), []);
  const handleCloseGuestChat = useCallback(() => setIsGuestChatVisible(false), []);
  const handleReportSubmit = useCallback(
    async (reason: string, details: string) => {
      if (!aiBotId) return;
      try {
        await profileStore.reportAiBot({ targetId: aiBotId, reason, details });
      } catch (error) {
        console.error("Failed to submit AI agent report", error);
      }
    },
    [aiBotId, profileStore],
  );

  const menuItems = useMemo(() => {
    if (!aiBotId) return [];
    const items: Array<{ label: string; icon: string; colorIcon: string; onPress: () => void }> = [];
    if (canEdit) {
      items.push({
        label: 'Редактировать',
        icon: 'create-outline',
        colorIcon: theme.black,
        onPress: handleEdit,
      });
      items.push({
        label: 'Удалить',
        icon: 'trash-outline',
        colorIcon: '#E63946',
        onPress: handleDeletePress,
      });
    }
    items.push({
      label: 'Report user',
      icon: 'megaphone-outline',
      colorIcon: '#E63946',
      onPress: handleOpenReport,
    });
    return items;
  }, [aiBotId, canEdit, handleDeletePress, handleEdit, handleOpenReport, theme.black]);

  const followButtonTitle = isFollowing ? "Отписаться" : "Подписаться";

  const handleRefresh = useCallback(async () => {
    if (!aiBotId || isLoading || isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      await Promise.all([
        aiBotStore.fetchAiBotById(aiBotId),
        aiBotStore.fetchBotDetails(aiBotId),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [aiBotId, aiBotStore, isLoading, isRefreshing]);

  if (isLoading && !aiBot) {
    return <ScreenLoader />;
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.white}
            colors={[theme.white]}
          />
        }
      >
        <View style={styles.header}>
          <AiAgentHeader
            theme={theme}
            onBack={onBack}
            onShare={handleShare}
            items={menuItems}
          />
          <Spacer />

          <AiAgentHeroCard
            styles={styles}
            theme={theme}
            avatarUri={avatarUri}
            displayName={displayName}
            profession={profession}
            categories={categories}
            followButtonTitle={followButtonTitle}
            onToggleFollow={handleToggleFollow}
            isFollowUpdating={isFollowUpdating}
            disableFollowAction={disableFollowAction}
            onStartChat={handleStartChatPress}
            isChatLoading={isChatLoading}
            aiBotId={aiBotId}
            isFollowing={isFollowing}
            onAvatarPress={avatarUri ? handleOpenAvatarPreview : undefined}
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
            createdAt={formattedCreatedAt}
          />
        ) : (
          <AiAgentGallery
            isLoading={botDetailsLoading}
            photos={botPhotos}
            galleryColumns={galleryColumns}
            galleryItemSize={galleryItemSize}
          />
        )}
      </ScrollView>
      <ReportModal
        visible={isReportVisible}
        onClose={handleCloseReport}
        onSubmit={handleReportSubmit}
        type="user"
      />
      {aiBotId ? (
        <GuestAiChatModal
          visible={isGuestChatVisible}
          onClose={handleCloseGuestChat}
          botId={aiBotId}
          botName={displayName}
        />
      ) : null}
      {avatarUri ? (
        <ModalProfilePhoto
          previewVisible={isAvatarPreviewVisible}
          handleClosePreview={handleCloseAvatarPreview}
          photoUri={avatarUri}
          isMe={false}
          goToEditProfileSetting={noop}
        />
      ) : null}
    </>
  );
};

