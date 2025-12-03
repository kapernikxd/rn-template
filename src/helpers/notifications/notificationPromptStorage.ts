import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PROMPT_KEY = 'pendingNotificationPrompt';

export const markNotificationPromptPending = async () => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PROMPT_KEY, '1');
  } catch (error) {
    console.warn('Failed to mark notification prompt as pending', error);
  }
};

export const consumeNotificationPromptPending = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_PROMPT_KEY);

    if (value === '1') {
      await AsyncStorage.removeItem(NOTIFICATION_PROMPT_KEY);
      return true;
    }
  } catch (error) {
    console.warn('Failed to consume notification prompt flag', error);
  }

  return false;
};
