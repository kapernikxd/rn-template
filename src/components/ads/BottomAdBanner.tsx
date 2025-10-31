import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
  RequestConfiguration,
} from 'react-native-google-mobile-ads';

import { ensureTrackingTransparencyPermission } from '../../services/privacy/trackingTransparency';
import { ANDROID_AD_UNIT_ID_BANNER, IOS_AD_UNIT_ID_BANNER } from '../../constants/links';

const isMobilePlatform = Platform.OS === 'ios' || Platform.OS === 'android';

export const BottomAdBanner = () => {
  useEffect(() => {
    if (!isMobilePlatform) {
      return;
    }

    let isMounted = true;

    const initializeAds = async () => {
      try {
        await ensureTrackingTransparencyPermission();

        if (!isMounted) {
          return;
        }

        const requestConfiguration: RequestConfiguration = {
          tagForChildDirectedTreatment: false,
        };

        await mobileAds().setRequestConfiguration(requestConfiguration);

        if (!isMounted) {
          return;
        }

        await mobileAds().initialize();
      } catch {
        // Silently ignore initialization errors to avoid crashing the UI.
      }
    };

    void initializeAds();

    return () => {
      isMounted = false;
    };
  }, []);

  const bannerAdUnitId = useMemo(() => {
    if (__DEV__) return TestIds.BANNER;

    return Platform.select({
      ios: IOS_AD_UNIT_ID_BANNER,
      android: ANDROID_AD_UNIT_ID_BANNER,
      default: undefined,
    });
  }, []);

  if (!isMobilePlatform || !bannerAdUnitId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
});

