import React, { FC, useMemo } from 'react';
import { Platform } from 'react-native';

import { useRootStore, useStoreData } from '../../store/StoreProvider';
import { resolveAdSource, type AdSource } from '../../types/ads';
import { GoogleBottomAdBanner } from './google/BottomBanner';
import { YandexBottomAdBanner } from './yandex';

type BottomAdBannerProps = {
  source?: AdSource;
};

export const BottomAdBanner: FC<BottomAdBannerProps> = ({ source }) => {
  const { configStore } = useRootStore();
  const adsConfig = useStoreData(configStore, (store) => store.adsConfig);

  const resolvedSource = useMemo(
    () => resolveAdSource(source ?? adsConfig.ADS_SOURCE),
    [adsConfig.ADS_SOURCE, source],
  );

  const googleBannerUnitId = useMemo(
    () =>
      Platform.select({
        ios: adsConfig.IOS_AD_UNIT_ID_BANNER,
        android: adsConfig.ANDROID_AD_UNIT_ID_BANNER,
        default: undefined,
      }),
    [adsConfig.ANDROID_AD_UNIT_ID_BANNER, adsConfig.IOS_AD_UNIT_ID_BANNER],
  );

  const yandexBannerUnitId = useMemo(
    () =>
      Platform.select({
        ios: adsConfig.YANDEX_IOS_AD_UNIT_ID_BANNER,
        android: adsConfig.YANDEX_ANDROID_AD_UNIT_ID_BANNER,
        default: undefined,
      }),
    [
      adsConfig.YANDEX_ANDROID_AD_UNIT_ID_BANNER,
      adsConfig.YANDEX_IOS_AD_UNIT_ID_BANNER,
    ],
  );

  if (resolvedSource === 'yandex') {
    return <YandexBottomAdBanner adUnitId={yandexBannerUnitId} />;
  }

  return <GoogleBottomAdBanner unitId={googleBannerUnitId} />;
};
