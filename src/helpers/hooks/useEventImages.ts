import { useCallback } from "react";
import * as FileSystem from "expo-file-system";
import uuid from "react-native-uuid";
import { getImagePath } from "../../helpers/utils/files";

export const useEventImages = () => {
  const handleImagesProcessing = useCallback(
    async (values: any, existingImages?: any[]) => {
      const formData = new FormData();
      const removeFiles: any[] = [];

      // Определяем **новые** файлы (локальные URI)
      const newImages: string[] = (values.imageUploades ?? []).filter((uri: string) =>
        uri.startsWith("file://") || uri.startsWith("data:")
      );

      // Обрабатываем каждое изображение
      for (let i = 0; i < newImages.length; i++) {
        const uri = newImages[i];

        // Определяем расширение
        const extensionMatch = uri.match(/\.(\w+)$/);
        const extension = extensionMatch ? extensionMatch[1] : "jpg";
        const type = `image/${extension === "jpg" ? "jpeg" : extension}`;
        const fileName = `image-${uuid.v4()}.${extension}`;

        // Копируем файл в документ-директорию для стабильности на iOS
        const destPath = FileSystem.documentDirectory + fileName;

        await FileSystem.copyAsync({ from: uri, to: destPath });

        formData.append("files", {
          uri: destPath,
          name: fileName,
          type,
        } as any);
      }

      // Определяем **удаленные** файлы (которые были, но их больше нет)
      const removedImages = existingImages?.filter(
        (oldImg) => !(values.imageUploades ?? []).includes(getImagePath(oldImg))
      );

      removedImages?.forEach((img) => removeFiles.push(img));

      return { formData, newImages, removeFiles };
    },
    []
  );

  return { handleImagesProcessing };
};
