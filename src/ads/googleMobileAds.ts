import { Platform } from 'react-native';
import mobileAds, { type RequestConfiguration } from 'react-native-google-mobile-ads';

import { ensureAdConsent } from './consent';
import { ensureTrackingTransparencyPermission } from '../services/privacy/trackingTransparency';

const isMobilePlatform = Platform.OS === 'ios' || Platform.OS === 'android';
const TEST_DEVICE_HASHED_IDS = __DEV__ ? ['TEST-DEVICE-HASHED-ID'] : undefined;

let initializationPromise: Promise<void> | null = null;
let initialized = false;

const configureRequest = async () => {
  const requestConfiguration: RequestConfiguration = {
    tagForChildDirectedTreatment: false,
    testDeviceIdentifiers: TEST_DEVICE_HASHED_IDS,
  };

  await mobileAds().setRequestConfiguration(requestConfiguration);
};

export const ensureGoogleMobileAdsInitialized = async () => {
  if (!isMobilePlatform) {
    initialized = true;
    return;
  }

  if (initialized) return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    await ensureTrackingTransparencyPermission();
    await ensureAdConsent();
    await configureRequest();
    await mobileAds().initialize();
    initialized = true;
  })().catch((error) => {
    console.warn('[Ads] Failed to initialize Google Mobile Ads', error);
  }).finally(() => {
    initializationPromise = null;
  });

  return initializationPromise;
};

export const areGoogleAdsInitialized = () => initialized;
