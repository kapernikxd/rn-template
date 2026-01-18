import {
  AdsConsent,
  AdsConsentStatus,
  type AdsConsentInfo,
} from "react-native-google-mobile-ads";
import { logToServer } from "../helpers/utils/logger";

type LogLevel = "info" | "warn" | "error";

const CONSENT_TAG = "[AdsConsent]";

function logConsent(
  level: LogLevel,
  message: string,
  context: Record<string, unknown> = {},
) {
  const consoleLogger =
    level === "warn" ? console.warn : level === "error" ? console.error : console.log;

  consoleLogger(`${CONSENT_TAG} ${message}`, context);
  void logToServer(level, `${CONSENT_TAG} ${message}`, context);
}

export type ConsentInitResult = {
  status: AdsConsentStatus;
  canRequestAds: boolean;
  formAvailable: boolean;
};

export async function initAdsConsent(): Promise<ConsentInitResult> {
  logConsent("info", "Starting consent flow");

  let consentInfo: AdsConsentInfo;
  try {
    consentInfo = await AdsConsent.requestInfoUpdate();
    logConsent("info", "requestInfoUpdate status", { status: consentInfo.status });
  } catch (error) {
    logConsent("warn", "Failed to request info update", { error });
    throw error;
  }

  const shouldGatherConsent =
    consentInfo.status === AdsConsentStatus.REQUIRED ||
    consentInfo.status === AdsConsentStatus.UNKNOWN ||
    (__DEV__ && consentInfo.isConsentFormAvailable);

  if (__DEV__ && shouldGatherConsent) {
    logConsent("info", "Forcing consent form in dev environment");
  }

  if (shouldGatherConsent) {
    try {
      logConsent("info", "Gathering consent");
      await AdsConsent.gatherConsent();
    } catch (error) {
      logConsent("warn", "Failed to gather consent", { error });
    }
  }

  const updatedInfo = await AdsConsent.getConsentInfo();

  logConsent("info", "Updated consent info", {
    status: updatedInfo.status,
    canRequestAds: updatedInfo.canRequestAds,
    formAvailable: updatedInfo.isConsentFormAvailable,
  });

  return {
    status: updatedInfo.status,
    canRequestAds: updatedInfo.canRequestAds,
    formAvailable: updatedInfo.isConsentFormAvailable,
  };
}

export async function showPrivacyOptionsForm(): Promise<void> {
  logConsent("info", "Showing privacy options form");
  await AdsConsent.showForm();
}
