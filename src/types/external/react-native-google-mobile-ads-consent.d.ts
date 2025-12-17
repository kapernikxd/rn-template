declare module '@react-native-google-mobile-ads/consent' {
  export enum AdsConsentStatus {
    UNKNOWN = 0,
    REQUIRED = 1,
    NOT_REQUIRED = 2,
    OBTAINED = 3,
  }

  export enum AdsConsentDebugGeography {
    DISABLED = 0,
    EEA = 1,
    NOT_EEA = 2,
  }

  export type AdsConsentRequestParameters = {
    debugGeography?: AdsConsentDebugGeography;
    tagForUnderAgeOfConsent?: boolean;
    testDeviceIdentifiers?: string[];
  };

  export type AdsConsentInfo = {
    status: AdsConsentStatus;
    isConsentFormAvailable: boolean;
  };

  export type AdsConsentFormStatus = {
    status: AdsConsentStatus;
  };

  const AdsConsent: {
    requestInfoUpdate: (requestParameters?: AdsConsentRequestParameters) => Promise<AdsConsentInfo>;
    getConsentInfo: () => Promise<AdsConsentInfo>;
    loadAndShowConsentFormIfRequired: () => Promise<AdsConsentFormStatus>;
  };

  export default AdsConsent;
}
