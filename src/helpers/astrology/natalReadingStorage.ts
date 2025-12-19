import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'natalReadingCache';

export type StoredNatalReading = {
  reading: string;
  chartSignature: string;
  updatedAt: string;
};

export type StoredNatalReadings = Record<string, StoredNatalReading>;

const readStorage = async (): Promise<StoredNatalReadings> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed as StoredNatalReadings;
  } catch (error) {
    console.warn('Failed to read natal reading cache', error);
    await AsyncStorage.removeItem(STORAGE_KEY);
    return {};
  }
};

const writeStorage = async (payload: StoredNatalReadings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to save natal reading cache', error);
  }
};

export const getStoredNatalReadings = async (): Promise<StoredNatalReadings> =>
  readStorage();

export const getStoredNatalReading = async (
  key: string,
  chartSignature?: string,
): Promise<string | null> => {
  const storage = await readStorage();
  const entry = storage[key];

  if (!entry) {
    return null;
  }

  if (chartSignature && entry.chartSignature !== chartSignature) {
    return null;
  }

  return entry.reading;
};

export const saveNatalReading = async (
  key: string,
  reading: string,
  chartSignature: string,
): Promise<StoredNatalReadings> => {
  const storage = await readStorage();
  const updated: StoredNatalReadings = {
    ...storage,
    [key]: {
      reading,
      chartSignature,
      updatedAt: new Date().toISOString(),
    },
  };

  await writeStorage(updated);

  return updated;
};
