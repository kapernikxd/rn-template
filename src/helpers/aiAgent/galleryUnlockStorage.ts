import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_PREFIX = "aiAgentGalleryUnlocked:";

const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "");

const getStorageKey = (viewerId: string) => `${STORAGE_PREFIX}${sanitize(viewerId)}`;

const readUnlockMap = async (viewerId: string): Promise<Record<string, string[]>> => {
  const storageKey = getStorageKey(viewerId);
  const rawValue = await AsyncStorage.getItem(storageKey);

  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue) as Record<string, string[]>;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    // noop
  }

  await AsyncStorage.removeItem(storageKey);
  return {};
};

const persistUnlockMap = async (viewerId: string, value: Record<string, string[]>) => {
  const storageKey = getStorageKey(viewerId);
  await AsyncStorage.setItem(storageKey, JSON.stringify(value));
};

export const getUnlockedPhotosForBot = async (
  viewerId: string,
  botId: string,
): Promise<string[]> => {
  const unlockMap = await readUnlockMap(viewerId);
  const photos = unlockMap[botId];

  if (!Array.isArray(photos)) {
    return [];
  }

  return photos;
};

export const setUnlockedPhotosForBot = async (
  viewerId: string,
  botId: string,
  photos: string[],
) => {
  const unlockMap = await readUnlockMap(viewerId);
  unlockMap[botId] = Array.from(new Set(photos));
  await persistUnlockMap(viewerId, unlockMap);
};

export const addUnlockedPhotoForBot = async (
  viewerId: string,
  botId: string,
  photoUri: string,
) => {
  const unlockMap = await readUnlockMap(viewerId);
  const existing = unlockMap[botId] ?? [];
  unlockMap[botId] = Array.from(new Set([...existing, photoUri]));
  await persistUnlockMap(viewerId, unlockMap);
};
