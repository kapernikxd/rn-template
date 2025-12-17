import { createContext, useContext } from 'react';

export type AdsContextValue = {
  isAdsReady: boolean;
  canRequestAds: boolean;
  formAvailable: boolean;
  refreshConsent: () => Promise<void>;
  showPrivacyOptions: () => Promise<void>;
};

export const AdsContext = createContext<AdsContextValue | undefined>(undefined);

export const useAds = (): AdsContextValue => {
  const context = useContext(AdsContext);

  if (!context) {
    throw new Error('useAds must be used within an AdsProvider');
  }

  return context;
};
