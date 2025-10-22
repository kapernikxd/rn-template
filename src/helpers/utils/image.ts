const MAX_TARGET_LONG_SIDE = 1600; // px
const JPEG_QUALITY = 0.85;

const RASTER_EXTS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
  "bmp",
  "tif",
  "tiff",
];

const getFileExtLower = (name: string) => {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
};

const replaceExt = (name: string, ext: string) => {
  const i = name.lastIndexOf(".");
  if (i === -1) return name + ext;
  return name.slice(0, i) + ext;
};

export const isLikelyImage = (file: File): boolean => {
  if (file.type && file.type.startsWith("image/")) return true;
  const ext = getFileExtLower(file.name);
  return RASTER_EXTS.includes(ext);
};

const readAsImageBitmap = async (file: File): Promise<ImageBitmap> => createImageBitmap(file);

const imageToCanvas = (img: HTMLImageElement | ImageBitmap) => {
  let width: number;
  let height: number;

  if (img instanceof HTMLImageElement) {
    width = img.naturalWidth;
    height = img.naturalHeight;
  } else {
    width = img.width;
    height = img.height;
  }

  const maxSide = Math.max(width, height);
  const scale = maxSide > MAX_TARGET_LONG_SIDE ? MAX_TARGET_LONG_SIDE / maxSide : 1;
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(img as CanvasImageSource, 0, 0, width, height, 0, 0, targetW, targetH);

  return canvas;
};

const fileToHtmlImage = async (file: File): Promise<HTMLImageElement> => {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = document.createElement("img");
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = url;
  });
  return img;
};

export const normalizeImageToJpeg = async (file: File): Promise<File> => {
  try {
    const bitmap = await readAsImageBitmap(file);
    const canvas = imageToCanvas(bitmap);
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", JPEG_QUALITY),
    );
    return new File([blob], replaceExt(file.name, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    const img = await fileToHtmlImage(file);
    const canvas = imageToCanvas(img);
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", JPEG_QUALITY),
    );
    return new File([blob], replaceExt(file.name, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  }
};
