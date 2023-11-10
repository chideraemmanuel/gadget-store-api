import express, { request, response } from 'express';
import { products } from '../db';
import Product from '../models/product';
import Category from '../models/category';
import mongoose from 'mongoose';
import { json } from 'body-parser';
import { ObjectId } from 'mongodb';
import { paginateQuery } from '../lib/helpers';
import upload from '../config/multer';
import { port } from '../index';

interface GetQueryParams {
  // product_name?: string;
  // brand?: string;
  brand?: any;
  price?: {
    $gte: number;
    $lte: number;
  };
  category?: ObjectId;
}

export const getProducts = async (
  request: express.Request,
  response: express.Response
) => {
  // const queryParams = request.query;

  const { brand, price_range, category, page, limit } = request.query;
  // console.log(product_name, brand, price_range, category);

  if (page && isNaN(page as any)) {
    return response.status(400).json({ error: 'Page should be a number.' });
  }

  if (limit && isNaN(limit as any)) {
    return response.status(400).json({ error: 'Limit should be a number.' });
  }

  // Build the filter object based on query parameters
  const filter: GetQueryParams = {};

  // if (q) {
  //   filter.product_name = q.toString();
  // }

  if (category) {
    try {
      const storedCategory = await Category.findOne({ name: category });

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

  console.log(filter);

  try {
    // const products = await Product.find(filter).populate('category');
    // response.status(200).json(products);

    const paginationResponse = await paginateQuery(
      Product,
      response,
      filter,
      parseInt(page as string),
      parseInt(limit as string)
    );

    return paginationResponse;
  } catch (error: any) {
    console.log('DATABASE_SEARCH_ERROR', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }

  // return response.json({ message: 'Hello from GADGET STORE!' });
};

export const addProduct = async (
  request: express.Request,
  response: express.Response
) => {
  // const product = request.body;
  // const {
  //   product_name,
  //   brand,
  //   description,
  //   price,
  //   category,
  //   main_image,
  //   other_images,
  //   count_in_stock,
  // } = product;

  upload.single('main_image')(request, response, async (error) => {
    if (error) {
      response.status(500).json({ error: error.message });
    }

    const product = request.body;
    const {
      product_name,
      brand,
      description,
      price,
      category,
      main_image,
      other_images,
      count_in_stock,
    } = product;

    console.log({
      product_name,
      brand,
      description,
      price,
      category,
      main_image,
      other_images,
      count_in_stock,
    });

    // console.log('req file', request.file);

    if (
      !product_name ||
      !brand ||
      !description ||
      !price ||
      !category ||
      // !main_image ||
      // !other_images ||
      !count_in_stock
    ) {
      return response.status(400).json({
        error: 'Please supply the required product fields.',
      });
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

    // const editedProducts = {
    //   product_name: `${product_name}`.toLowerCase(),
    //   brand: `${brand}`.toLowerCase(),
    //   description: `${description}`.toLowerCase(),
    //   price: price as number,
    //   // category,
    //   main_image: `${main_image}`.toLowerCase(),
    //   other_images: [...other_images].map((image: string) => image.toLowerCase()),
    //   count_in_stock: count_in_stock as number,
    // };

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
        main_image: `http://localhost:5000/public/assets/${request.file?.filename}`,
        other_images,
        count_in_stock: count_in_stock as number,
      });
      return response.status(201).json(addedProduct);
    } catch (error: any) {
      console.log('[ADD_PRODUCT_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // console.log('req file2', request.file);
};

// ******************************************
// ******************************************
// ******************************************
// const User = mongoose.model('User', {
//   name: String,
// });

// User.createIndex({ name: 'text' });

// ******************************************
// ******************************************
// ******************************************
// const User = mongoose.model('User', {
//   name: String,
// });

// const users = await User.find({
//   $text: { $search: 'fluff' },
// });

// ******************************************
// ******************************************
// ******************************************
// ******************************************
// ******************************************
interface Updates {
  product_name?: string;
  brand?: string;
  description?: string;
  price?: number;
  category?: string;
  main_image?: string;
  other_images?: string[];
  count_in_stock?: number;
}

export const updateProduct = async (
  request: express.Request,
  response: express.Response
) => {
  const { id } = request.params;
  const {
    product_name,
    brand,
    description,
    price,
    category,
    main_image,
    other_images,
    count_in_stock,
  } = request.body;

  // REDUNDANT***************
  // if (!id) {
  //   return response
  //     .status(400)
  //     .json({ error: 'Please enter the ID if the document to be updated.' });
  // }

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid Product ID' });
  }

  // CHECK IF PRODUCT EXISTS
  try {
    const product = await Product.findById(id);

    if (!product) {
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
      !main_image &&
      !other_images &&
      !count_in_stock
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
        return response.status(400).json({ error: 'Price should be a number' });
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

    // *******************
    // MAIN IMAGE
    // OTHER IMAGES
    // *******************

    if (category) {
      // CHECK IF CATEGORY ID IS VALID
      if (!mongoose.isValidObjectId(category)) {
        return response.status(400).json({ error: 'Invalid Category ID' });
      }

      // CHECK IF CATEGORY EXISTS
      try {
        const categoryExists = await Category.findById(category);

        if (!categoryExists) {
          return response
            .status(404)
            .json({ error: 'Category with the provided ID does not exist.' });
        }

        updates.category = category;
      } catch (error: any) {
        console.log('[CATEGORY_FETCH_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    }

    try {
      console.log(updates);
      const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
        new: true,
      });

      // if (!updatedProduct) {
      //   return response.status(404).json({ error: 'Could not find the corresponding document.'})
      // }

      return response.status(200).json(updatedProduct);
    } catch (error: any) {
      console.log('[PRODUCT_UPDATE_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[PRODUCT_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
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
      await Product.findByIdAndDelete(id);
      return response
        .status(200)
        .json({ message: 'Product deleted successfully' });
    } catch (error: any) {
      console.log('[PRODUCT_DELETION_ERROR]', error);
    }
  } catch (error: any) {
    console.log('[PRODUCT_FETCH_ERROR]', error);
  }
};
