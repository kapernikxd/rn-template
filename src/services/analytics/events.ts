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
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export const trackEvent = async (
  name: AnalyticsEventName,
  attributes?: Record<string, unknown>,
) => reportEvent(name, attributes);
