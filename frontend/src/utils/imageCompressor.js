export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/jpeg'
  } = options;

  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob) || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    if (file.size < 120 * 1024 && !file.type.includes('png')) {
      return resolve(file);
    }

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
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const fileName = file.name ? file.name.replace(/\.[^/.]+$/, '.jpg') : 'compressed-image.jpg';
            const compressedFile = new File([blob], fileName, {
              type: mimeType,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          mimeType,
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
