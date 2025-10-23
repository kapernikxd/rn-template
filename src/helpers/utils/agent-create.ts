import { GalleryItem } from "../../types/aiBot";

const canUseObjectUrl =
  typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function";

const isObjectUrl = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.startsWith("blob:");

export function revokeIfNeeded(url?: string | null) {
  if (!canUseObjectUrl || !isObjectUrl(url)) {
    return;
  }
  URL.revokeObjectURL(url);
}

export function revokeGallery(items: GalleryItem[]) {
  if (!canUseObjectUrl) {
    return;
  }
  items.forEach((item) => {
    if (isObjectUrl(item.preview)) {
      URL.revokeObjectURL(item.preview);
    }
  });
}
