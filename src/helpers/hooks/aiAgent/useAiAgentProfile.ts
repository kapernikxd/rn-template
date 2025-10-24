import { useCallback, useEffect, useMemo, useState } from "react";
import { useRootStore, useStoreData } from "../../../store/StoreProvider";
import { getUserFullName } from "../../utils/user";
import { Highlight } from "../../../types/aiBot";
import { usePortalNavigation } from "../useNavigation";


export type ActiveTab = "info" | "gallery";

export function useAiAgentProfile(aiBotId?: string) {
  const { goBack, goToChatMessages } = usePortalNavigation();
  const { aiBotStore, authStore, chatStore } = useRootStore();
  const isMdUp = true;

  // Stores
  const aiBot = useStoreData(aiBotStore, (s) => s.selectAiBot);
  const isLoading = useStoreData(aiBotStore, (s) => s.isAiUserLoading);
  const botDetails = useStoreData(aiBotStore, (s) => s.botDetails);
  const botPhotos = useStoreData(aiBotStore, (s) => s.botPhotos);
  const botDetailsLoading = useStoreData(aiBotStore, (s) => s.photosLoading);
  const myBots = useStoreData(aiBotStore, (s) => s.myBots);
  const isAuthenticated = useStoreData(authStore, (s) => s.isAuthenticated);

  // Local state
  const [activeTab, setActiveTab] = useState<ActiveTab>("info");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowUpdating, setIsFollowUpdating] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Initial data
  useEffect(() => {
    if (!aiBotId) return;
    aiBotStore.clearSelectedAiBot();
    aiBotStore.clearBotDetails();
    void aiBotStore.fetchAiBotById(aiBotId);
    void aiBotStore.fetchBotDetails(aiBotId);
    return () => {
      aiBotStore.clearSelectedAiBot();
      aiBotStore.clearBotDetails();
    };
  }, [aiBotId, aiBotStore]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (myBots.length) return;
    void aiBotStore.fetchMyAiBots();
  }, [isAuthenticated, myBots.length, aiBotStore]);

  // Derived
  const highlights = useMemo<Highlight[]>(() => {
    if (!aiBot) return [];
    const creator = aiBot.createdBy;
    const creatorName = creator ? getUserFullName(creator) : "";
    return [
      {
        title: "Creator Info",
        lines: [
          {
            label: "Creator",
            value: creatorName,
          },
          {
            label: "Created",
            value: `${aiBot.createdAt}`,
          },
        ],
      },
    ];
  }, [aiBot]);

  const aiBotProfileId = aiBot?._id;
  const isFollowing = botDetails?.isFollowing ?? aiBot?.isFollowing ?? false;
  const disableFollowAction = !isAuthenticated || !aiBotProfileId;

  const isCreator = useMemo(() => {
    if (!aiBot) return false;
    return myBots.some((bot) => bot._id === aiBot._id);
  }, [aiBot, myBots]);
  const canEdit = Boolean(aiBot) && isCreator;

  useEffect(() => {
    if (!isCreator) setIsEditOpen(false);
  }, [isCreator]);


  const handleToggleFollow = useCallback(async () => {
    if (!aiBotProfileId || disableFollowAction) return;
    setIsFollowUpdating(true);
    try {
      await aiBotStore.followAiBot(aiBotProfileId);
    } finally {
      setIsFollowUpdating(false);
    }
  }, [aiBotStore, aiBotProfileId, disableFollowAction]);

  const handleStartChat = useCallback(async () => {
    if (!aiBotProfileId || isChatLoading || !isAuthenticated) return;
    setIsChatLoading(true);
    try {
      const response = await chatStore.messageById(aiBotProfileId);
      const chatData = response?.chat ?? response?.data?.chat;
      const chatIdCandidate =
        typeof chatData === "string"
          ? chatData
          : chatData && typeof chatData === "object"
            ? chatData._id
            : response?.data?._id ?? response?._id;
      const chatId = typeof chatIdCandidate === "string" ? chatIdCandidate : undefined;

      if (chatId) {
        goToChatMessages({ chatId });
      }
    } catch (e) {
      console.error("Failed to start chat with AI agent:", e);
    } finally {
      setIsChatLoading(false);
    }
  }, [aiBotProfileId, chatStore, goToChatMessages, isAuthenticated, isChatLoading]);

  const handleAiAgentDeleted = useCallback(() => {
    goBack()
  }, []);

  const closeEditDialog = useCallback(() => setIsEditOpen(false), []);

  return {
    // stores + data
    aiBot, isLoading, botDetails, botPhotos, botDetailsLoading,
    // ui state
    activeTab, setActiveTab,
    isEditOpen, setIsEditOpen, closeEditDialog,
    isFollowUpdating, isChatLoading,
    // perms/flags
    canEdit, isCreator, isFollowing, disableFollowAction,
    // computed
    highlights, aiBotProfileId,
    // env
    isMdUp,
    // auth
    isAuthenticated,
    // handlers
    onBack: goBack, handleToggleFollow, handleStartChat, handleAiAgentDeleted,
  } as const;
}