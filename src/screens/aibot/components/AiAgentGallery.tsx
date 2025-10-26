import React, { memo, useCallback, useState } from "react";
import { AiAgentGalleryView } from "rn-vs-lb";

type AiAgentGalleryProps = {
  isLoading: boolean;
  photos: string[];
  galleryColumns: number;
  galleryItemSize: number;
};

export const AiAgentGallery = memo(
  ({ isLoading, photos, galleryColumns, galleryItemSize }: AiAgentGalleryProps) => {
    const [visible, setVisible] = useState(false);
    const [index, setIndex] = useState(0);

    const onOpenAt = useCallback((i: number) => {
      setIndex(i);
      setVisible(true);
    }, []);

    const onClose = useCallback(() => setVisible(false), []);

    return (
      <AiAgentGalleryView
        isLoading={isLoading}
        photos={photos}
        galleryColumns={galleryColumns}
        galleryItemSize={galleryItemSize}
        visible={visible}
        initialIndex={index}
        onOpenAt={onOpenAt}
        onClose={onClose}
        emptyTest="Создатель еще не добавил фото."
      />
    );
  }
);

AiAgentGallery.displayName = "AiAgentGallery";
export default AiAgentGallery;
