import multer from 'multer';
import { v4 as uuid } from 'uuid';

// const FILE_TYPE_MAP = {
//   'image/png': 'png',
//   'image/jpeg': 'jpeg',
//   'image/jpg': 'jpg',
// };

// const storage = multer.diskStorage({
//   destination: 'src/assets',
//   filename: (req, file, callback) => {
//     // const isImage = FILE_TYPE_MAP[file.mimetype];
//     const isImage = FILE_TYPE_MAP.find((type) => type === file.mimetype);
//     const extension = file.mimetype.split('/')[1];
//     console.log('isImage', isImage);
//     console.log('extension', extension);
//     let callbackError: Error | null;

//     console.log('file', file);

//     if (isImage) {
//       callbackError = null;
//     } else {
//       callbackError = new Error('Invalid image format');
//     }

//     callback(callbackError, `product_image-${uuid()}.${extension}`);
//   },
// });

// const upload = multer({ storage });

// export default upload;

const FILE_TYPE_MAP = ['image/png', 'image/jpeg', 'image/jpg'];

const productImageStorage = multer.diskStorage({
  destination: 'src/assets/products',
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

export const productImageUpload = multer({ storage: productImageStorage });

const brandLogoStorage = multer.diskStorage({
  destination: 'src/assets/brands',
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

    callback(callbackError, `brand_logo-${uuid()}.${extension}`);
  },
});

export const brandLogoUpload = multer({ storage: brandLogoStorage });

const billboardImageStorage = multer.diskStorage({
  destination: 'src/assets/billboards',
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

    callback(callbackError, `billboard_image-${uuid()}.${extension}`);
  },
});

export const billboardImageUpload = multer({ storage: billboardImageStorage });
