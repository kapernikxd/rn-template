import AsyncStorage from '@react-native-async-storage/async-storage';

export const PROFILE_INFO_STORAGE_KEY = 'profileInfo';

export type ProfileInfoData = {
  username: string;
  gender: string;
  zodiacSign: string;
  age: string;
  maritalStatus: string;
  partnerName: string;
  hasChildren: string;
};

export const defaultProfileInfo: ProfileInfoData = {
  username: '',
  gender: '',
  zodiacSign: '',
  age: '',
  maritalStatus: '',
  partnerName: '',
  hasChildren: '',
};

export const createEmptyProfileInfo = (): ProfileInfoData => ({
  ...defaultProfileInfo,
});

const sanitizeProfileInfo = (
  data: Partial<ProfileInfoData> | null | undefined,
): ProfileInfoData => ({
  ...createEmptyProfileInfo(),
  ...(data ?? {}),
});

export const getProfileInfo = async (): Promise<ProfileInfoData> => {
  try {
    const storedValue = await AsyncStorage.getItem(PROFILE_INFO_STORAGE_KEY);

    if (!storedValue) {
      return createEmptyProfileInfo();
    }

    const parsedValue = JSON.parse(storedValue) as Partial<ProfileInfoData>;

    return sanitizeProfileInfo(parsedValue);
  } catch (error) {
    console.warn('Failed to load profile info', error);
    await AsyncStorage.removeItem(PROFILE_INFO_STORAGE_KEY);
    return createEmptyProfileInfo();
  }
};

export const saveProfileInfo = async (
  profileInfo: ProfileInfoData,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      PROFILE_INFO_STORAGE_KEY,
      JSON.stringify(sanitizeProfileInfo(profileInfo)),
    );
  } catch (error) {
    console.warn('Failed to save profile info', error);
    throw error;
  }
};

export const mergeProfileInfo = async (
  partialProfileInfo: Partial<ProfileInfoData>,
): Promise<ProfileInfoData> => {
  const currentProfileInfo = await getProfileInfo();
  const mergedProfileInfo = sanitizeProfileInfo({
    ...currentProfileInfo,
    ...partialProfileInfo,
  });

  await saveProfileInfo(mergedProfileInfo);

  return mergedProfileInfo;
};

export const clearProfileInfo = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_INFO_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear profile info', error);
    throw error;
  }
};
