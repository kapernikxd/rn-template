import React, { FC, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'rn-vs-lb/theme';

import {
  areGoogleAdsInitialized,
  ensureGoogleMobileAdsInitialized,
} from '../../../ads/googleMobileAds';
import { useRootStore, useStoreData } from '../../../store/StoreProvider';

const isMobilePlatform = Platform.OS === 'ios' || Platform.OS === 'android';

export type GoogleBottomAdBannerProps = {
  unitId?: string;
};

export const GoogleBottomAdBanner: FC<GoogleBottomAdBannerProps> = ({ unitId }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { configStore } = useRootStore();
  const adsEnabled = useStoreData(configStore, (store) => store.adsEnabled);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adsReady, setAdsReady] = useState(areGoogleAdsInitialized());

  useEffect(() => {
    if (!isMobilePlatform || !adsEnabled) return;

    let isMounted = true;
    const initializeAds = async () => {
      try {
        await ensureGoogleMobileAdsInitialized();
        if (!isMounted) return;
        setAdsReady(true);
      } catch {
        // ignore errors
      }
    };

    void initializeAds();
    return () => {
      isMounted = false;
    };
  }, [adsEnabled]);

  const bannerAdUnitId = useMemo(() => {
    if (__DEV__) return TestIds.BANNER;

    return unitId;
  }, [unitId]);

  if (!adsEnabled || !isMobilePlatform || !bannerAdUnitId || !adsReady) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingBottom: adLoaded ? 0 : insets.bottom,
        },
      ]}
    >
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={() => setAdLoaded(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
