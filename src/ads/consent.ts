import { Platform } from 'react-native';
import AdsConsent, {
  AdsConsentDebugGeography,
  AdsConsentStatus,
  type AdsConsentInfo,
  type AdsConsentFormStatus,
  type AdsConsentRequestParameters,
} from '@react-native-google-mobile-ads/consent';

const isMobilePlatform = Platform.OS === 'ios' || Platform.OS === 'android';
const TEST_DEVICE_HASHED_IDS = __DEV__ ? ['TEST-DEVICE-HASHED-ID'] : undefined;

export type ConsentFlowResult = {
  status: AdsConsentStatus;
  formAvailable: boolean;
  formShown: boolean;
};

const getDebugRequestOptions = (): AdsConsentRequestParameters | undefined => {
  if (!__DEV__) return undefined;

  return {
    debugGeography: AdsConsentDebugGeography.EEA,
    testDeviceIdentifiers: TEST_DEVICE_HASHED_IDS,
  } satisfies AdsConsentRequestParameters;
};

const logConsentState = (
  context: string,
  status: AdsConsentStatus,
  formAvailable: boolean,
  formShown: boolean,
) => {
  const statusLabel = AdsConsentStatus[status] ?? String(status);
  console.log(
    `[AdsConsent] ${context}: status=${statusLabel} formAvailable=${formAvailable} formShown=${formShown}`,
  );
};

const requestConsentInfo = async () => {
  const requestParameters = getDebugRequestOptions();
  return AdsConsent.requestInfoUpdate(requestParameters);
};

const resolveLatestConsentStatus = async (fallbackStatus: AdsConsentStatus) => {
  try {
    const info = await AdsConsent.getConsentInfo();
    return info.status;
  } catch {
    return fallbackStatus;
  }
};

export const ensureAdConsent = async (): Promise<ConsentFlowResult> => {
  if (!isMobilePlatform) {
    return { status: AdsConsentStatus.NOT_REQUIRED, formAvailable: false, formShown: false };
  }

  let consentInfo: AdsConsentInfo | null = null;
  let formShown = false;

  try {
    consentInfo = await requestConsentInfo();

    if (consentInfo.status === AdsConsentStatus.REQUIRED && consentInfo.isConsentFormAvailable) {
      const formStatus: AdsConsentFormStatus = await AdsConsent.loadAndShowConsentFormIfRequired();
      formShown = true;
      consentInfo = { ...consentInfo, status: formStatus.status };
    }
  } catch (error) {
    console.warn('[AdsConsent] Failed to complete consent flow', error);
  }

  const status = consentInfo?.status ?? AdsConsentStatus.UNKNOWN;
  const formAvailable = consentInfo?.isConsentFormAvailable ?? false;
  const finalStatus = await resolveLatestConsentStatus(status);

  logConsentState('ensureAdConsent', finalStatus, formAvailable, formShown);

  return {
    status: finalStatus,
    formAvailable,
    formShown,
  };
};

export const requestConsentForm = async (): Promise<ConsentFlowResult> => {
  if (!isMobilePlatform) {
    return { status: AdsConsentStatus.NOT_REQUIRED, formAvailable: false, formShown: false };
  }

  const info = await requestConsentInfo();
  if (!info.isConsentFormAvailable) {
    logConsentState('requestConsentForm', info.status, false, false);
    return { status: info.status, formAvailable: false, formShown: false };
  }

  const formStatus = await AdsConsent.loadAndShowConsentFormIfRequired();
  const finalStatus = await resolveLatestConsentStatus(formStatus.status);

  logConsentState('requestConsentForm', finalStatus, true, true);

  return {
    status: finalStatus,
    formAvailable: true,
    formShown: true,
  };
};

export const getConsentStatusLabel = (status: AdsConsentStatus) => {
  switch (status) {
    case AdsConsentStatus.REQUIRED:
      return 'required';
    case AdsConsentStatus.OBTAINED:
      return 'obtained';
    case AdsConsentStatus.NOT_REQUIRED:
      return 'notRequired';
    default:
      return 'unknown';
  }
};

export const getCurrentConsentStatus = async (): Promise<AdsConsentStatus> => {
  if (!isMobilePlatform) {
    return AdsConsentStatus.NOT_REQUIRED;
  }

  try {
    const info = await requestConsentInfo();
    logConsentState('getCurrentConsentStatus', info.status, info.isConsentFormAvailable, false);
    return info.status;
  } catch (error) {
    console.warn('[AdsConsent] Failed to fetch current consent status', error);
    return AdsConsentStatus.UNKNOWN;
  }
};
