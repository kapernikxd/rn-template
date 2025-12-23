import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

import type { HoroscopeCategory } from '../../types/astrology';

const HOROSCOPE_STORAGE_KEY = 'horoscopeCache';

export type StoredHoroscopes = Partial<Record<HoroscopeCategory, string>>;

type HoroscopeStoragePayload = {
  date: string;
  data: StoredHoroscopes;
  previousDate?: string;
  previousData?: StoredHoroscopes;
};

const getTodayKey = () => dayjs().format('YYYY-MM-DD');
const getYesterdayKey = () => dayjs().subtract(1, 'day').format('YYYY-MM-DD');

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
    const previousDate =
      parsedValue && typeof parsedValue.previousDate === 'string'
        ? parsedValue.previousDate
        : undefined;
    const previousData =
      parsedValue && parsedValue.previousData && typeof parsedValue.previousData === 'object'
        ? (parsedValue.previousData as StoredHoroscopes)
        : undefined;

    return {
      date,
      data,
      previousDate,
      previousData,
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
  return storedValue?.date === getTodayKey() ? storedValue.data : {};
};

export const getStoredHoroscopeForToday = async (
  category: HoroscopeCategory,
): Promise<string | null> => {
  const storedValue = await readStorage();

  if (!storedValue || storedValue.date !== getTodayKey()) {
    return null;
  }

  return storedValue.data?.[category] ?? null;
};

export const getStoredHoroscopeForYesterday = async (
  category: HoroscopeCategory,
): Promise<string | null> => {
  const storedValue = await readStorage();

  if (!storedValue) {
    return null;
  }

  const yesterdayKey = getYesterdayKey();

  if (storedValue.date === yesterdayKey) {
    return storedValue.data?.[category] ?? null;
  }

  if (storedValue.date === getTodayKey() && storedValue.previousDate === yesterdayKey) {
    return storedValue.previousData?.[category] ?? null;
  }

  return null;
};

export const saveHoroscopeForToday = async (
  category: HoroscopeCategory,
  horoscope: string,
): Promise<StoredHoroscopes> => {
  const today = getTodayKey();
  const storedValue = await readStorage();

  const baseData = storedValue?.date === today ? storedValue.data ?? {} : {};
  const previousDate = storedValue?.date === today ? storedValue.previousDate : storedValue?.date;
  const previousData = storedValue?.date === today ? storedValue.previousData : storedValue?.data;

  const updatedData: StoredHoroscopes = {
    ...baseData,
    [category]: horoscope,
  };

  await writeStorage({
    date: today,
    data: updatedData,
    previousDate,
    previousData,
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
