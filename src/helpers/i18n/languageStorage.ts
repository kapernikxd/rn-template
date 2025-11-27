import AsyncStorage from '@react-native-async-storage/async-storage';

export const LANGUAGE_STORAGE_KEY = 'preferredLanguage';

export const getPreferredLanguage = async (): Promise<string | null> => {
  try {
    const storedValue = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedValue ?? null;
  } catch (error) {
    console.warn('Failed to load preferred language', error);
    return null;
  }
};

export const setPreferredLanguage = async (languageCode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (error) {
    console.warn('Failed to save preferred language', error);
    throw error;
  }
};

export const clearPreferredLanguage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear preferred language', error);
    throw error;
  }
};
