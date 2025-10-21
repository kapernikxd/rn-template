import { Alert } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const ensureAbsoluteUrl = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

const cacheDirectory = () => {
  const directory = new Directory(Paths.cache, 'chat-images');
  try {
    directory.create({ intermediates: true, idempotent: true });
  } catch (error) {
    console.warn('cacheDirectory create error', error);
  }
  return directory;
};

const buildFileName = (url: string) => url.split('/').pop() || `image_${Date.now()}.jpg`;

const downloadToCache = async (url: string): Promise<File | null> => {
  try {
    const finalUrl = ensureAbsoluteUrl(url);
    const directory = cacheDirectory();
    const fileName = buildFileName(finalUrl);
    const targetFile = new File(directory, fileName);

    return await File.downloadFileAsync(finalUrl, targetFile);
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
        downloaded.delete();
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
        downloaded.delete();
      } catch (cleanupError) {
        console.warn('shareImageFromUrl cleanup error', cleanupError);
      }
    }
  } catch (e) {
    console.warn('shareImageFromUrl error', e);
    Alert.alert('Error', 'Failed to share image');
  }
}