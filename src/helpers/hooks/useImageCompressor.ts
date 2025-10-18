import { useCallback } from 'react';
import ImageResizer from 'react-native-image-resizer';

/**
 * Хук для сжатия изображений без изменения размеров.
 * Использует react-native-image-resizer.
 */
export const useImageCompressor = () => {
  const compressImage = useCallback(async (uri: string, width?: number, height?: number): Promise<string> => {
    try {
      // Fallback размеры, если не переданы
      const fallbackWidth = 1000;
      const fallbackHeight = 1000;

      const resized = await ImageResizer.createResizedImage(
        uri,
        width || fallbackWidth,
        height || fallbackHeight,
        'JPEG',
        60 // качество от 0 до 100
      );

      return resized.uri;
    } catch (err) {
      console.error('Image compression failed:', err);
      throw err;
    }
  }, []);

  return { compressImage };
};
