import mobileAds, { AdsConsent, type AdsConsentInfo } from "react-native-google-mobile-ads";

/**
 * Возвращает:
 * - canRequestAds: можно ли запрашивать/показывать рекламу
 * - isConsentFormAvailable: доступна ли форма (для кнопки Privacy Options)
 */
export async function initAdsConsent(): Promise<{
  canRequestAds: boolean;
  isConsentFormAvailable: boolean;
}> {
  // 1) Обновляем информацию о consent
  const consentInfo: AdsConsentInfo = await AdsConsent.requestInfoUpdate();

  // 2) Если требуется — показываем форму (UMP сам решит: EU / US states / etc.)
  if (
    consentInfo.status === "REQUIRED" ||
    consentInfo.status === "UNKNOWN"
  ) {
    await AdsConsent.gatherConsent();
  }

  // 3) Берём актуальное состояние
  const updated = await AdsConsent.getConsentInfo();

  // 4) Если можно запрашивать рекламу — инициализируем SDK
  if (updated.canRequestAds) {
    await mobileAds().initialize();
  }

  return {
    canRequestAds: updated.canRequestAds,
    isConsentFormAvailable: updated.isConsentFormAvailable,
  };
}

/** Открыть “Privacy options” (если доступно) */
export async function showPrivacyOptionsForm(): Promise<void> {
  await AdsConsent.showForm();
}
