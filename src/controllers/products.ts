import express, { request, response } from 'express';
import { products } from '../db';
import Product from '../models/product';
import Category from '../models/category';
import mongoose from 'mongoose';
import { json } from 'body-parser';
import { ObjectId } from 'mongodb';
import upload from '../config/multer';
import { port } from '../index';
import fs from 'fs';
import paginateQuery from '../lib/helpers/paginateQuery';
import getImageName from '../lib/helpers/getImageName';

interface GetQueryParams {
  product_name?: any;
  // brand?: string;
  brand?: any;
  price?: {
    $gte: number;
    $lte: number;
  };
  category?: ObjectId;
  featured?: 'true' | 'false';
}

export const getProducts = async (
  request: express.Request,
  response: express.Response
) => {
  // const queryParams = request.query;

  const { search_query, brand, price_range, category, featured, page, limit } =
    request.query;
  // console.log(product_name, brand, price_range, category);

  if (page && isNaN(page as any)) {
    return response.status(400).json({ error: 'Page should be a number.' });
  }

  if (limit && isNaN(limit as any)) {
    return response.status(400).json({ error: 'Limit should be a number.' });
  }

  // Build the filter object based on query parameters
  const filter: GetQueryParams = {};

  if (search_query) {
    // filter.product_name = search_query.toString();
    filter.product_name = { $regex: search_query as string, $options: 'i' };
  }

  if (category) {
    const isValidId = mongoose.isValidObjectId(category);

    try {
      // const storedCategory = await Category.findOne({
      //   $or: [{ name: category }, { _id: category }],
      // });
      const storedCategory = isValidId
        ? await Category.findById(category)
        : await Category.findOne({ name: category });

      if (!storedCategory) {
        return response.status(404).json({ error: 'Category does not exist' });
      }

      filter.category = storedCategory?._id;
    } catch (error: any) {
      console.log('[CATEGORY_FETCH_ERROR]', error);
    }
  }

  if (brand) {
    // filter.brand = brand.toString();
    filter.brand = { $regex: brand as string, $options: 'i' };
    // filter.brand = { $regex: new RegExp(brand.toString(), 'i') };
  }

  if (price_range) {
    const [minPrice, maxPrice] = price_range.toString().split('-').map(Number);
    filter.price = { $gte: minPrice, $lte: maxPrice };
  }

  if (featured) {
    if (featured !== 'true' && featured !== 'false') {
      return response
        .status(400)
        .json({ error: 'Featured must be a boolean value' });
    }

    filter.featured = featured;
  }

  // if (featured) {
  //   if (featured !== true && featured !== false) {
  //   return response
  //     .status(400)
  //     .json({ error: 'Featured must be a boolean value' });
  //   }

  //   filter.featured = featured;
  // }

  // if (populate) {
  //   if (populate !== 'true' && populate !== 'false') {
  //     return response
  //       .status(400)
  //       .json({ error: 'Populate shoule be set to either true or false' });
  //   }
  // }

  console.log(filter);

  try {
    // const products = await Product.find(filter).populate('category');
    // response.status(200).json(products);

    const paginationResponse = await paginateQuery({
      model: Product,
      response,
      filter,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    return paginationResponse;
  } catch (error: any) {
    console.log('[DATABASE_SEARCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }

  // return response.json({ message: 'Hello from GADGET STORE!' });
};

export const getSingleProduct = async (
  request: express.Request,
  response: express.Response
) => {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid Product ID' });
  }

  try {
    const product = await Product.findById(id).populate('category');

    if (!product) {
      return response
        .status(404)
        .json({ error: 'Product with the supplied ID does not exist' });
    }

    return response.status(200).json(product);
  } catch (error: any) {
    console.log('[PRODUCT_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addProduct = async (
  request: express.Request,
  response: express.Response
) => {
  upload.single('product_image')(request, response, async (error) => {
    if (
      error?.code === 'LIMIT_FILE_COUNT' ||
      error?.code === 'LIMIT_UNEXPECTED_FILE'
    ) {
      return response.status(400).json({
        error: 'Product image should be a single file',
        errorCode: error?.code,
        //  errorMessage: error?.message,
      });
    }

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    // @ts-ignore
    if (!request.file) {
      return response.status(400).json({
        error: 'Please supply the required product fields.',
      });
    }

    const product = request.body;

    console.log('product', product);

    const {
      product_name,
      brand,
      description,
      price,
      category,
      product_image,
      count_in_stock,
      featured,
    } = product;

    // console.log('req file', request.file);
    // console.log('req files', request.files);

    // @ts-ignore
    const productImage = request.file;
    // @ts-ignore
    //  const otherImages = request.files?.other_images.map((file) => {
    //    return `http://localhost:5000/public/assets/${file?.filename}`;
    //  });

    //  console.log('main image', mainImage);
    //  console.log('other images', otherImages);

    if (
      !product_name ||
      !brand ||
      !description ||
      !price ||
      !category ||
      !count_in_stock ||
      !featured ||
      // !product_image ||
      !productImage
      //  !otherImages
    ) {
      return response.status(400).json({
        error: 'Please supply the required product fields.',
      });
    }

    // CHECK IF FEATURED IS A BOOLEAN
    if (typeof featured !== 'boolean') {
      return response
        .status(400)
        .json({ error: 'Featured should be a boolean value' });
    }

    // CHECK IF PRICE IS A NUMBER
    if (isNaN(price)) {
      return response.status(400).json({ error: 'Price should be a number' });
    }

    // CHECK IF COUNT IN STOCK IS A NUMBER
    if (isNaN(count_in_stock)) {
      return response
        .status(400)
        .json({ error: 'Count in stock should be a number' });
    }

    // CHECK IF CATEGORY ID IS VALID
    if (!mongoose.isValidObjectId(category)) {
      return response.status(400).json({ error: 'Invalid Object ID' });
    }

    // CHECK IF CATEGORY EXISTS
    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return response
        .status(404)
        .json({ error: 'Category with the provided ID does not exist.' });
    }

    try {
      // console.log('[REQUEST]', request);

      // console.log('[REQUEST_PROTOCOL]', request.protocol);
      // console.log('[REQUEST_HOSTNAME]', request.hostname);
      // console.log('[REQUEST_BASE_URL]', request.baseUrl);

      // const baseUrl = `${request.protocol}://${request.hostname}:${port}/public/assets`

      const addedProduct = await Product.create({
        product_name,
        brand,
        description,
        price,
        category,
        // product_image: `http://localhost:5000/public/assets/products/${productImage?.filename}`,
        product_image: `http://localhost:5000/public/assets/${productImage?.filename}`,
        //  other_images: otherImages,
        count_in_stock: count_in_stock as number,
        featured,
      });
      return response.status(201).json(addedProduct);
    } catch (error: any) {
      console.log('[ADD_PRODUCT_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // UPLOAD.FIELD() TAKES AN ARRAY OF FILE FIELDS AND ADDS AN OBJECT CONTAINING EACH, WITH THE NAME AS THE KEY, AND AN ARRAY OF THE FILES FROM SUCH FIELD AS THE VALUE TO THE REQUEST.FILES OBJECT
  // upload.fields([
  //   { name: 'main_image', maxCount: 1 },
  //   { name: 'other_images', maxCount: 5 },
  // ])(request, response, async (error: any) => {
  //  // HANDLE MULTIPLE FILE UPLOAD HERE
  // });
};

interface Updates {
  product_name?: string;
  brand?: string;
  description?: string;
  price?: number;
  category?: string;
  product_image?: string;
  count_in_stock?: number;
  featured?: boolean;
}

export const updateProduct = async (
  request: express.Request,
  response: express.Response
) => {
  upload.single('product_image')(request, response, async (error) => {
    if (
      error?.code === 'LIMIT_FILE_COUNT' ||
      error?.code === 'LIMIT_UNEXPECTED_FILE'
    ) {
      return response.status(400).json({
        error: 'Product image should be a single file',
        errorCode: error?.code,
      });
    }

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    const { id } = request.params;
    const {
      product_name,
      brand,
      description,
      price,
      category,
      product_image,
      // other_images,
      count_in_stock,
      featured,
    } = request.body;

    if (!mongoose.isValidObjectId(id)) {
      return response.status(400).json({ error: 'Invalid Product ID' });
    }

    // CHECK IF PRODUCT EXISTS
    try {
      const productExists = await Product.findById(id);

      if (!productExists) {
        return response
          .status(404)
          .json({ error: 'Product with the supplied ID does not exist.' });
      }

      if (
        !product_name &&
        !brand &&
        !description &&
        !price &&
        !category &&
        !count_in_stock &&
        featured === undefined &&
        // !main_image &&
        // !other_images &&
        !request.file
        // @ts-ignore
        // !request.files?.product_image
        // @ts-ignore
        // !request.files?.other_images
      ) {
        return response.status(400).json({
          error: 'No field to be edited was supplied',
        });
      }

      // BUILD UPDATES BASED ON BODY DATA
      const updates: Updates = {};

      if (product_name) {
        updates.product_name = product_name;
      }

      if (brand) {
        updates.brand = brand;
      }

      if (description) {
        updates.description = description;
      }

      if (price) {
        // CHECK IF PRICE IS A NUMBER
        if (isNaN(price)) {
          return response
            .status(400)
            .json({ error: 'Price should be a number' });
        } else {
          updates.price = +price;
        }
      }

      if (count_in_stock) {
        // CHECK IF COUNT IN STOCK IS A NUMBER
        if (isNaN(count_in_stock)) {
          return response
            .status(400)
            .json({ error: 'Count in stock should be a number' });
        } else {
          updates.count_in_stock = +count_in_stock;
        }
      }

      // console.log('featured', featured);
      // console.log('type of featured', typeof featured);

      if (featured !== undefined) {
        if (typeof featured !== 'boolean') {
          return response
            .status(400)
            .json({ error: 'Featured should be a boolean' });
        } else {
          updates.featured = featured;
        }
      }

      // @ts-ignore
      if (request.file) {
        // @ts-ignore
        const mainImage = request.file;
        // updates.product_image = `http://localhost:5000/public/assets/products/${mainImage?.filename}`;
        updates.product_image = `http://localhost:5000/public/assets/${mainImage?.filename}`;
      }
      // @ts-ignore
      // if (request.files?.other_images) {
      //   // @ts-ignore
      //   const otherImages = request.files?.other_images.map((file) => {
      //     return `http://localhost:5000/public/assets/${file?.filename}`;
      //   });
      //   updates.other_images = otherImages;
      // }

      if (category) {
        // CHECK IF CATEGORY ID IS VALID
        if (!mongoose.isValidObjectId(category)) {
          return response.status(400).json({ error: 'Invalid Category ID' });
        }

        // CHECK IF CATEGORY EXISTS
        try {
          const categoryExists = await Category.findById(category);

          if (!categoryExists) {
            return response.status(404).json({
              error: 'Category with the provided ID does not exist.',
            });
          }

          updates.category = category;
        } catch (error: any) {
          console.log('[CATEGORY_FETCH_ERROR]', error);
          return response.status(500).json({ error: 'Internal Server Error' });
        }
      }

      console.log(updates);

      try {
        const session = await mongoose.startSession();

        try {
          const transactionResult = session.withTransaction(async () => {
            const updatedProduct = await Product.findByIdAndUpdate(
              id,
              updates,
              {
                new: true,
                session,
              }
            );

            const imageUrls = [productExists.product_image];

            const filePaths = imageUrls.map(
              // (filePath) => `src/assets/products/${getImageName(filePath)}`
              (filePath) => `src/assets/${getImageName(filePath)}`
            );

            const promises = filePaths.map((filePath) => {
              return new Promise((resolve, reject) => {
                fs.unlink(filePath, (error) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve('');
                  }
                });
              });
            });

            await Promise.all(promises);

            return response.status(200).json(updatedProduct);
          });

          return transactionResult;
        } catch (error: any) {
          console.log('[TRANSACTION_ERROR]', error);
          return response.status(500).json({ error: 'Internal Server Error' });
        } finally {
          await session.endSession();
        }
      } catch (error: any) {
        console.log('[SESSION_START_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (error: any) {
      console.log('[PRODUCT_FETCH_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // upload.fields([
  //   { name: 'main_image', maxCount: 1 },
  //   { name: 'other_images' maxCount: 5 },
  // ])(request, response, async (error: any) => {
  //  // HANDLE MULTIPLE FILE UPLOAD HERE
  // });
};

export const deleteProduct = async (
  request: express.Request,
  response: express.Response
) => {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const productExists = await Product.findById(id);

    if (!productExists) {
      return response
        .status(404)
        .json({ error: 'Product with the supplied ID does not exist.' });
    }

    try {
      const session = await mongoose.startSession();

      try {
        const transactionResult = await session.withTransaction(async () => {
          await Product.findByIdAndDelete(id, { session });

          const imageUrls = [productExists.product_image];

          const filePaths = imageUrls.map(
            // (filePath) => `src/assets/products/${getImageName(filePath)}`
            (filePath) => `src/assets/${getImageName(filePath)}`
          );

          const promises = filePaths.map((filePath) => {
            return new Promise((resolve, reject) => {
              fs.unlink(filePath, (error) => {
                if (error) {
                  reject(error);
                } else {
                  resolve('');
                }
              });
            });
          });

          await Promise.all(promises);

          return response
            .status(200)
            .json({ message: 'Product deleted successfully' });
        });

        return transactionResult;
      } catch (error: any) {
        console.log('[TRANSACTION_ERROR]', error);
        // await session.abortTransaction();
        return response.status(500).json({ error: 'Internal Server Error' });
      } finally {
        await session.endSession();
      }
    } catch (error: any) {
      console.log('[SESSION_START_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[PRODUCT_FETCH_ERROR]', error);
  }
};
