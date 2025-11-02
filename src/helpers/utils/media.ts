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
    Alert.alert('Ошибка', 'Не удалось обработать изображение');
    return null;
  }
};

export async function saveImageToPhotos(url: string) {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Требуется разрешение', 'Необходимо разрешение на доступ к медиатеке');
      return;
    }

    const downloaded = await downloadToCache(url);
    if (!downloaded) return;

    try {
      await MediaLibrary.saveToLibraryAsync(downloaded.uri);
      Alert.alert('Сохранено', 'Изображение сохранено в «Фото»');
    } finally {
      try {
        downloaded.delete();
      } catch (cleanupError) {
        console.warn('saveImageToPhotos cleanup error', cleanupError);
      }
    }
  } catch (e) {
    console.warn('saveImageToPhotos error', e);
    Alert.alert('Ошибка', 'Не удалось сохранить изображение');
  }
}

export async function shareImageFromUrl(url: string) {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Обмен недоступен', 'Обмен недоступен на этом устройстве');
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
    Alert.alert('Ошибка', 'Не удалось поделиться изображением');
  }
}