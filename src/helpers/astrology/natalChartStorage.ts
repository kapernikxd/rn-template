import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NatalChartPayload } from '../../types/astrology';

/**
 * Snapshot of the generated natal chart that we persist for reuse in chats.
 * We also save a signature so we can make sure the chart and readings belong together.
 */
type StoredNatalChart = {
  chart: NatalChartPayload;
  chartSignature: string;
  savedAt: string;
};

// Single key to avoid scattering natal chart data across multiple storage entries.
const STORAGE_KEY = 'natalChartPayload';
const PARTNER_STORAGE_KEY = 'partnerNatalChartPayload';

export const getStoredNatalChart = async (): Promise<StoredNatalChart | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredNatalChart | null;

    if (!parsed || typeof parsed !== 'object' || !parsed.chart) return null;

    return parsed;
  } catch (error) {
    console.warn('Failed to read stored natal chart', error);
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const saveNatalChart = async (
  chart: NatalChartPayload,
  chartSignature: string,
): Promise<void> => {
  try {
    const payload: StoredNatalChart = {
      chart,
      chartSignature,
      savedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to save natal chart payload', error);
  }
};

export const getStoredPartnerNatalChart = async (): Promise<StoredNatalChart | null> => {
  try {
    const raw = await AsyncStorage.getItem(PARTNER_STORAGE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredNatalChart | null;

    if (!parsed || typeof parsed !== 'object' || !parsed.chart) return null;

    return parsed;
  } catch (error) {
    console.warn('Failed to read stored partner natal chart', error);
    await AsyncStorage.removeItem(PARTNER_STORAGE_KEY);
    return null;
  }
};

export const savePartnerNatalChart = async (
  chart: NatalChartPayload,
  chartSignature: string,
): Promise<void> => {
  try {
    const payload: StoredNatalChart = {
      chart,
      chartSignature,
      savedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to save partner natal chart payload', error);
  }
};
