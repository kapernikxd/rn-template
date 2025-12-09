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
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

export const trackEvent = async (
  name: AnalyticsEventName,
  attributes?: Record<string, unknown>,
) => reportEvent(name, attributes);
