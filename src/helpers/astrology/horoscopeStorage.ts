import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

import type { HoroscopeCategory } from '../../types/astrology';

const HOROSCOPE_STORAGE_KEY = 'horoscopeCache';

export type StoredHoroscopes = Partial<Record<HoroscopeCategory, string>>;

type HoroscopeStoragePayload = {
  date: string;
  data: StoredHoroscopes;
};

const getTodayKey = () => dayjs().format('YYYY-MM-DD');

const readStorage = async (): Promise<HoroscopeStoragePayload | null> => {
  try {
    const rawValue = await AsyncStorage.getItem(HOROSCOPE_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<HoroscopeStoragePayload>;
    const date = typeof parsedValue?.date === 'string' ? parsedValue.date : '';
    const data =
      parsedValue && typeof parsedValue === 'object' && parsedValue.data && typeof parsedValue.data === 'object'
        ? (parsedValue.data as StoredHoroscopes)
        : {};

    if (date !== getTodayKey()) {
      return null;
    }

    return {
      date,
      data,
    };
  } catch (error) {
    console.warn('Failed to read horoscope cache', error);
    await AsyncStorage.removeItem(HOROSCOPE_STORAGE_KEY);
    return null;
  }
};

const writeStorage = async (payload: HoroscopeStoragePayload) => {
  try {
    await AsyncStorage.setItem(HOROSCOPE_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to save horoscope cache', error);
    throw error;
  }
};

export const getStoredHoroscopesForToday = async (): Promise<StoredHoroscopes> => {
  const storedValue = await readStorage();
  return storedValue?.data ?? {};
};

export const getStoredHoroscopeForToday = async (
  category: HoroscopeCategory,
): Promise<string | null> => {
  const storedValue = await readStorage();

  if (!storedValue) {
    return null;
  }

  return storedValue.data?.[category] ?? null;
};

export const saveHoroscopeForToday = async (
  category: HoroscopeCategory,
  horoscope: string,
): Promise<StoredHoroscopes> => {
  const today = getTodayKey();
  const storedValue = await readStorage();

  const baseData = storedValue?.date === today ? storedValue.data ?? {} : {};

  const updatedData: StoredHoroscopes = {
    ...baseData,
    [category]: horoscope,
  };

  await writeStorage({
    date: today,
    data: updatedData,
  });

  return updatedData;
};

export const clearHoroscopes = async () => {
  try {
    await AsyncStorage.removeItem(HOROSCOPE_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear horoscope cache', error);
  }
};
