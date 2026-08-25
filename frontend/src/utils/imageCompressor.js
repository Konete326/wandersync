const isWebPSupported = () => {
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
};

export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1200,
    quality = 0.80,
    preferWebP = true,
    forceConversion = false
  } = options;

  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob) || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      return resolve(file);
    }

    if (!forceConversion && file.size < 60 * 1024 && file.type === 'image/webp') {
      return resolve(file);
    }

    const useWebP = preferWebP && isWebPSupported();
    const targetMime = useWebP ? 'image/webp' : 'image/jpeg';
    const extension = useWebP ? '.webp' : '.jpg';

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const baseName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'optimized-photo';
            const optimizedFile = new File([blob], `${baseName}${extension}`, {
              type: targetMime,
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          },
          targetMime,
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
};

export const compressMultipleImages = async (files, options = {}) => {
  if (!files || !files.length) return [];
  const fileArray = Array.from(files);
  return await Promise.all(fileArray.map((f) => compressImage(f, options)));
};

export const formatBytes = (bytes, decimals = 1) => {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const getCompressionSavings = (originalFile, compressedFile) => {
  if (!originalFile || !compressedFile) return null;
  const originalSize = originalFile.size || 0;
  const compressedSize = compressedFile.size || 0;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const percentage = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  return {
    originalSize: formatBytes(originalSize),
    compressedSize: formatBytes(compressedSize),
    savedBytes: formatBytes(savedBytes),
    percentage
  };
};
