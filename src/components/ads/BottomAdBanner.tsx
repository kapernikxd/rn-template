import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
  RequestConfiguration,
} from 'react-native-google-mobile-ads';

import { ensureTrackingTransparencyPermission } from '../../services/privacy/trackingTransparency';

const ANDROID_BANNER_AD_UNIT_ID = 'ca-app-pub-8636022279548301/8567360540';
const IOS_BANNER_AD_UNIT_ID = 'ca-app-pub-8636022279548301/4752416229';

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
      ios: IOS_BANNER_AD_UNIT_ID,
      android: ANDROID_BANNER_AD_UNIT_ID,
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

