import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

type DownloadedFile = {
  uri: string;
  fileUri: string;
};

const ensureAbsoluteUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

const buildFileUri = (url: string) => {
  const fileName = url.split('/').pop() || `image_${Date.now()}.jpg`;
  return `${FileSystem.cacheDirectory ?? ''}${fileName}`;
};

const downloadToCache = async (url: string): Promise<DownloadedFile | null> => {
  try {
    const finalUrl = ensureAbsoluteUrl(url);
    const fileUri = buildFileUri(finalUrl);

    const { uri } = await FileSystem.downloadAsync(finalUrl, fileUri);

    return { uri, fileUri: uri };
  } catch (error) {
    console.warn('downloadToCache error', error);
    Alert.alert('Error', 'Failed to process image');
    return null;
  }
};

export async function saveImageToPhotos(url: string) {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Media Library permission is required');
      return;
    }

    const downloaded = await downloadToCache(url);
    if (!downloaded) return;

    try {
      await MediaLibrary.saveToLibraryAsync(downloaded.uri);
      Alert.alert('Saved', 'Image saved to Photos');
    } finally {
      try {
        await FileSystem.deleteAsync(downloaded.fileUri, { idempotent: true });
      } catch (cleanupError) {
        console.warn('saveImageToPhotos cleanup error', cleanupError);
      }
    }
  } catch (e) {
    console.warn('saveImageToPhotos error', e);
    Alert.alert('Error', 'Failed to save image');
  }
}

export async function shareImageFromUrl(url: string) {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device');
      return;
    }

    const downloaded = await downloadToCache(url);
    if (!downloaded) return;

    try {
      await Sharing.shareAsync(downloaded.uri);
    } finally {
      try {
        await FileSystem.deleteAsync(downloaded.fileUri, { idempotent: true });
      } catch (cleanupError) {
        console.warn('shareImageFromUrl cleanup error', cleanupError);
      }
    }
  } catch (e) {
    console.warn('shareImageFromUrl error', e);
    Alert.alert('Error', 'Failed to share image');
  }
}
