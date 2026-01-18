import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import mobileAds from 'react-native-google-mobile-ads';

import { AdsContext } from './AdsContext';
import { initAdsConsent, showPrivacyOptionsForm } from './consent';

type AdsProviderProps = {
  children: React.ReactNode;
};

export const AdsProvider: React.FC<AdsProviderProps> = ({ children }) => {
  const [canRequestAds, setCanRequestAds] = useState(false);
  const [formAvailable, setFormAvailable] = useState(false);
  const [isAdsReady, setIsAdsReady] = useState(false);
  const sdkInitializedRef = useRef(false);

  const initializeMobileAds = useCallback(async () => {
    if (sdkInitializedRef.current) {
      return;
    }

    try {
      console.log('[AdsProvider] Initializing Mobile Ads SDK');
      await mobileAds().initialize();
      sdkInitializedRef.current = true;
      setIsAdsReady(true);
    } catch (error) {
      console.warn('[AdsProvider] Failed to initialize ads SDK', error);
    }
  }, []);

  const refreshConsent = useCallback(async () => {
    console.log('[AdsProvider] Refreshing consent state');
    try {
      const { canRequestAds: consentAllowed, formAvailable: consentFormAvailable, status } =
        await initAdsConsent();

      setCanRequestAds(consentAllowed);
      setFormAvailable(consentFormAvailable);
      setIsAdsReady(consentAllowed && sdkInitializedRef.current);

      console.log('[AdsProvider] Consent status:', status);
      console.log('[AdsProvider] canRequestAds:', consentAllowed);
      console.log('[AdsProvider] formAvailable:', consentFormAvailable);

      if (consentAllowed) {
        await initializeMobileAds();
      }
    } catch (error) {
      console.warn('[AdsProvider] Failed to refresh consent', error);
    }
  }, [initializeMobileAds]);

  const showPrivacyOptions = useCallback(async () => {
    try {
      await showPrivacyOptionsForm();
      await refreshConsent();
    } catch (error) {
      console.warn('[AdsProvider] Failed to show privacy options', error);
    }
  }, [refreshConsent]);

  useEffect(() => {
    void refreshConsent();
  }, [refreshConsent]);

  const contextValue = useMemo(
    () => ({
      canRequestAds,
      formAvailable,
      isAdsReady: isAdsReady || (canRequestAds && sdkInitializedRef.current),
      refreshConsent,
      showPrivacyOptions,
    }),
    [canRequestAds, formAvailable, isAdsReady, refreshConsent, showPrivacyOptions],
  );

  return <AdsContext.Provider value={contextValue}>{children}</AdsContext.Provider>;
};
