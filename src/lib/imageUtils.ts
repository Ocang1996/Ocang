/**
 * Image utility functions for compression and optimization
 */

import { IMAGE_CONFIG } from './config';

/**
 * Compresses an image using HTML5 Canvas
 * @param file The original image file to compress
 * @param options Compression options
 * @returns Promise with the compressed image as a File object and the dataURL
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    targetSize?: number; // Target size in bytes
    attemptCount?: number; // Track recursive attempts
  } = {}
): Promise<{ compressedFile: File; dataUrl: string }> {
  // Default options from config
  const maxWidth = options.maxWidth || IMAGE_CONFIG.COMPRESSION.MAX_WIDTH;
  const maxHeight = options.maxHeight || IMAGE_CONFIG.COMPRESSION.MAX_HEIGHT;
  const targetSize = options.targetSize || IMAGE_CONFIG.COMPRESSION.TARGET_SIZE;
  const attemptCount = options.attemptCount || 1;
  
  // Determine initial quality based on file size
  let quality = IMAGE_CONFIG.COMPRESSION.DEFAULT_QUALITY;
  if (file.size > IMAGE_CONFIG.COMPRESSION.LARGE_IMAGE_THRESHOLD) {
    quality = IMAGE_CONFIG.COMPRESSION.LARGE_IMAGE_QUALITY;
  }
  if (options.quality !== undefined) {
    quality = options.quality; // Override with provided quality
  }

  // Load the image
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };
  
  // Create object URL from file
  const url = URL.createObjectURL(file);
  
  try {
    // Load the image
    const img = await loadImage(url);
    
    // Calculate dimensions while maintaining aspect ratio
    let width = img.width;
    let height = img.height;
    
    // Calculate scale factor - more aggressive for large images
    let scaleFactor = 1;
    
    if (attemptCount > 1) {
      // Progressively reduce dimensions for each attempt
      scaleFactor = Math.min(0.9, 1 - (0.1 * attemptCount));
    }
    
    // Apply scale factor
    const targetWidth = maxWidth * scaleFactor;
    const targetHeight = maxHeight * scaleFactor;
    
    // Resize if needed
    if (width > height && width > targetWidth) {
      height = Math.round(height * (targetWidth / width));
      width = Math.round(targetWidth);
    } else if (height > targetHeight) {
      width = Math.round(width * (targetHeight / height));
      height = Math.round(targetHeight);
    }
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    // Draw image on canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Draw image with a white background (for transparent images)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    
    // Determine the output type
    // Force JPEG for large images to improve compression (unless PNG is required)
    const isPNGRequired = file.type === 'image/png' && hasTransparency(ctx, width, height);
    const outputType = isPNGRequired ? 'image/png' : 'image/jpeg';
    
    // Get compressed data URL
    const dataUrl = canvas.toDataURL(outputType, quality);
    
    // Convert data URL to a Blob
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    // Create compressed file
    const compressedFile = new File([ab], file.name, { type: mimeType });
    
    // If still too large, try different compression strategies
    if (compressedFile.size > targetSize) {
      // Safety check: don't go into infinite recursion
      if (attemptCount > 5) {
        console.warn('Reached maximum compression attempts, returning best effort result');
        return { compressedFile, dataUrl };
      }
      
      // Strategy 1: Try with lower quality first for JPEGs
      if (outputType === 'image/jpeg' && quality > 0.4) {
        // Calculate new quality - more aggressive reduction for larger files
        const newQuality = Math.max(0.4, quality - 0.15);
        return compressImage(file, {
          ...options,
          quality: newQuality,
          attemptCount: attemptCount + 1
        });
      }
      
      // Strategy 2: Reduce dimensions more aggressively
      return compressImage(file, {
        ...options,
        maxWidth: Math.round(width * 0.9),
        maxHeight: Math.round(height * 0.9),
        attemptCount: attemptCount + 1
      });
    }
    
    return { compressedFile, dataUrl };
  } finally {
    // Clean up object URL
    URL.revokeObjectURL(url);
  }
}

/**
 * Checks if an image has transparency (important for deciding between PNG and JPEG)
 */
function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  // Sample the image data to check for transparency
  // Only sample a subset of pixels for performance
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const pixelCount = data.length / 4;
  const sampleStep = Math.max(1, Math.floor(pixelCount / 1000)); // Sample at most 1000 pixels
  
  for (let i = 3; i < data.length; i += 4 * sampleStep) {
    if (data[i] < 255) {
      return true; // Found a transparent pixel
    }
  }
  
  return false;
}

/**
 * Creates a file object from a data URL
 * @param dataUrl The data URL string
 * @param filename The desired filename
 * @returns File object
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Creates a thumbnail image from a source image
 * @param file The source image file
 * @param maxDimension The maximum width or height
 * @returns Promise with thumbnail data URL
 */
export async function createThumbnail(file: File, maxDimension: number = IMAGE_CONFIG.THUMBNAIL.MAX_DIMENSION): Promise<string> {
  const { dataUrl } = await compressImage(file, {
    maxWidth: maxDimension,
    maxHeight: maxDimension,
    quality: IMAGE_CONFIG.THUMBNAIL.QUALITY
  });
  
  return dataUrl;
}

/**
 * Validates if a file is an allowed image type and within size limits
 * @param file The file to validate
 * @returns Object with validation result and error message
 */
export function validateImageFile(file: File): { isValid: boolean; errorMessage?: string } {
  // Check file size
  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      errorMessage: `Ukuran file melebihi batas maksimum (${IMAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB)`
    };
  }
  
  // Check file type
  if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      errorMessage: `Format file tidak didukung (hanya ${IMAGE_CONFIG.ALLOWED_TYPES.map(t => t.replace('image/', '').toUpperCase()).join(', ')})`
    };
  }
  
  return { isValid: true };
} 