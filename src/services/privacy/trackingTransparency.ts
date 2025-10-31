import { Platform } from 'react-native';
import {
  TrackingStatus,
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';

let cachedStatus: TrackingStatus | null = null;
let inFlightRequest: Promise<TrackingStatus> | null = null;

const shouldRequestPermission = (status: TrackingStatus) => status === 'undetermined';

const resolveTrackingStatus = async (): Promise<TrackingStatus> => {
  const { status: initialStatus } = await getTrackingPermissionsAsync();

  if (!shouldRequestPermission(initialStatus)) {
    return initialStatus;
  }

  const { status: requestedStatus } = await requestTrackingPermissionsAsync();

  return requestedStatus;
};

export const ensureTrackingTransparencyPermission = async (): Promise<TrackingStatus> => {
  if (Platform.OS !== 'ios') {
    return 'unavailable';
  }

  if (cachedStatus && !shouldRequestPermission(cachedStatus)) {
    return cachedStatus;
  }

  if (!inFlightRequest) {
    inFlightRequest = resolveTrackingStatus().finally(() => {
      inFlightRequest = null;
    });
  }

  cachedStatus = await inFlightRequest;

  return cachedStatus;
};
