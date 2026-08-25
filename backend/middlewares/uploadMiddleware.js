import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are supported'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export const uploadSingle = (fieldName = 'image') => upload.single(fieldName);

export const uploadMultiple = (fieldName = 'images', maxCount = 5) => upload.array(fieldName, maxCount);

export { upload };
export default upload;
