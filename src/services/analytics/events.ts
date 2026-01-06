import { reportEvent } from "./appMetrica";

export const AnalyticsEvent = {
  ScreenView: "screen_view",
  LanguageSelected: "language_selected",
  ZodiacSelected: "zodiac_selected",
  OnboardingCompleted: "onboarding_completed",
  HoroscopeCardOpened: "horoscope_card_opened",
  NotificationsAccepted: "notifications_accepted",
  ProfileSaved: "profile_saved",
  AppLinkShared: "app_link_shared",
  NatalChartGenerateStarted: "natal_chart_generate_started",
  NatalChartGenerateSuccess: "natal_chart_generate_success",
  NatalChartGenerateFailed: "natal_chart_generate_failed",
  NatalChartCopy: "natal_chart_copy",
  NatalReadingOpen: "natal_reading_open",
  NatalReadingLoadSuccess: "natal_reading_load_success",
  NatalReadingLoadFailed: "natal_reading_load_failed",
  NatalReadingRetry: "natal_reading_retry",
  ChatsScreenViewed: "chats_screen_viewed",
  ChatsTabChanged: "chats_tab_changed",
  ChatsSearchPerformed: "chats_search_performed",
  ChatsRefreshed: "chats_refreshed",
  ChatsLoadMore: "chats_load_more",
  ChatOpened: "chat_opened",
  ChatDeleted: "chat_deleted",
  ChatMessagesViewed: "chat_messages_viewed",
  ChatMessagesRefreshed: "chat_messages_refreshed",
  ChatMessagesLoadMore: "chat_messages_load_more",
  ChatMessageSent: "chat_message_sent",
  ChatMessageEdited: "chat_message_edited",
  ChatMessageDeleted: "chat_message_deleted",
  ChatMessageCopied: "chat_message_copied",
  ChatMessagePinned: "chat_message_pinned",
  ChatMessageUnpinned: "chat_message_unpinned",
  ChatMessageReported: "chat_message_reported",
  ChatMessageReplyStarted: "chat_message_reply_started",
  ChatHistoryCleared: "chat_history_cleared",
  ChatPinnedMessageOpened: "chat_pinned_message_opened",
  ChatTypingStarted: "chat_typing_started",
  ChatTypingStopped: "chat_typing_stopped",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export const trackEvent = async (
  name: AnalyticsEventName,
  attributes?: Record<string, unknown>,
) => reportEvent(name, attributes);
