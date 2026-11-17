import imageCompression from 'browser-image-compression';

export interface CompressedImageResult {
  file: File;
  previewUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatio: number;
}

/**
 * Compresses an image client-side to a maximum of 200KB,
 * resizing down to max 1200px (width or height) and converting to WebP for modern web efficiency.
 */
export async function compressListingImage(file: File): Promise<CompressedImageResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  const options = {
    maxSizeMB: 0.2, // 200 KB limit as requested
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    const compressedFile = new File(
      [compressedBlob],
      `${file.name.replace(/\.[^/.]+$/, '')}.webp`,
      { type: 'image/webp' }
    );

    const compressedSizeKb = Math.round(compressedFile.size / 1024);
    const previewUrl = URL.createObjectURL(compressedFile);
    const compressionRatio = Math.max(
      0,
      Math.round(((originalSizeKb - compressedSizeKb) / (originalSizeKb || 1)) * 100)
    );

    return {
      file: compressedFile,
      previewUrl,
      originalSizeKb,
      compressedSizeKb,
      compressionRatio,
    };
  } catch (error) {
    console.warn('Client-side compression fallback:', error);
    // Fallback to original file if compression fails on an unusual format
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      originalSizeKb,
      compressedSizeKb: originalSizeKb,
      compressionRatio: 0,
    };
  }
}

/**
 * Compresses an array of up to 6 image files concurrently.
 */
export async function compressMultipleImages(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<CompressedImageResult[]> {
  const limitedFiles = files.slice(0, 6);
  const results: CompressedImageResult[] = [];

  for (let i = 0; i < limitedFiles.length; i++) {
    const compressed = await compressListingImage(limitedFiles[i]);
    results.push(compressed);
    if (onProgress) {
      onProgress(i + 1, limitedFiles.length);
    }
  }

  return results;
}

