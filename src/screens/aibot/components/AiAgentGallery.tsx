import React, { memo } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

import { AiAgentStyles } from "../styles";

type AiAgentGalleryProps = {
  styles: AiAgentStyles;
  isLoading: boolean;
  photos: string[];
  galleryColumns: number;
  galleryItemSize: number;
};

export const AiAgentGallery = memo(
  ({ styles, isLoading, photos, galleryColumns, galleryItemSize }: AiAgentGalleryProps) => {
    if (isLoading) {
      return (
        <View style={styles.galleryWrapper}>
          <ActivityIndicator />
        </View>
      );
    }

    if (!photos.length) {
      return (
        <View style={styles.galleryWrapper}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Создатель еще не добавил фото.</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.galleryWrapper}>
        <View style={styles.galleryGrid}>
          {photos.map((photo, index) => {
            const isLastInRow = (index + 1) % galleryColumns === 0;
            return (
              <Image
                key={`${photo}-${index}`}
                source={{ uri: photo }}
                style={[
                  styles.galleryImage,
                  isLastInRow && styles.galleryImageLast,
                  { width: galleryItemSize, height: galleryItemSize },
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  },
);

AiAgentGallery.displayName = "AiAgentGallery";
