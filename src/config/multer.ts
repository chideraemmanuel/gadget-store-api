import multer from 'multer';
import { v4 as uuid } from 'uuid';

// const FILE_TYPE_MAP = {
//   'image/png': 'png',
//   'image/jpeg': 'jpeg',
//   'image/jpg': 'jpg',
// };

const FILE_TYPE_MAP = ['image/png', 'image/jpeg', 'image/jpg'];

const storage = multer.diskStorage({
  destination: 'src/assets',
  filename: (req, file, callback) => {
    // const isImage = FILE_TYPE_MAP[file.mimetype];
    const isImage = FILE_TYPE_MAP.find((type) => type === file.mimetype);
    const extension = file.mimetype.split('/')[1];
    console.log('isImage', isImage);
    console.log('extension', extension);
    let callbackError: Error | null;

    console.log('file', file);

    if (isImage) {
      callbackError = null;
    } else {
      callbackError = new Error('Invalid image format');
    }

    callback(callbackError, `product_image-${uuid()}.${extension}`);
  },
});

const upload = multer({ storage });

export default upload;
