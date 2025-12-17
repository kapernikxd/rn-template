import {
  AdsConsent,
  AdsConsentStatus,
  type AdsConsentInfo,
} from 'react-native-google-mobile-ads';

export type ConsentInitResult = {
  status: AdsConsentStatus;
  canRequestAds: boolean;
  formAvailable: boolean;
};

export async function initAdsConsent(): Promise<ConsentInitResult> {
  console.log('[AdsConsent] Starting consent flow');

  let consentInfo: AdsConsentInfo;
  try {
    consentInfo = await AdsConsent.requestInfoUpdate();
    console.log('[AdsConsent] requestInfoUpdate status:', consentInfo.status);
  } catch (error) {
    console.warn('[AdsConsent] Failed to request info update', error);
    throw error;
  }

  if (
    consentInfo.status === AdsConsentStatus.REQUIRED ||
    consentInfo.status === AdsConsentStatus.UNKNOWN
  ) {
    try {
      console.log('[AdsConsent] Gathering consent');
      await AdsConsent.gatherConsent();
    } catch (error) {
      console.warn('[AdsConsent] Failed to gather consent', error);
    }
  }

  const updatedInfo = await AdsConsent.getConsentInfo();

  console.log('[AdsConsent] Updated status:', updatedInfo.status);
  console.log('[AdsConsent] canRequestAds:', updatedInfo.canRequestAds);
  console.log('[AdsConsent] formAvailable:', updatedInfo.isConsentFormAvailable);

  return {
    status: updatedInfo.status,
    canRequestAds: updatedInfo.canRequestAds,
    formAvailable: updatedInfo.isConsentFormAvailable,
  };
}

export async function showPrivacyOptionsForm(): Promise<void> {
  console.log('[AdsConsent] Showing privacy options form');
  await AdsConsent.showForm();
}
