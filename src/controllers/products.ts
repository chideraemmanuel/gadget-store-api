import express, { request } from 'express';
import { products } from '../db';
import Product from '../models/product';

interface QueryParams {
  // product_name?: string;
  // brand?: string;
  brand?: any;
  price?: {
    $gte: number;
    $lte: number;
  };
  category?: string;
}

export const getProducts = async (
  request: express.Request,
  response: express.Response
) => {
  // const queryParams = request.query;

  const { brand, price_range, category } = request.query;
  // console.log(product_name, brand, price_range, category);

  // Build the filter object based on query parameters
  const filter: QueryParams = {};

  // if (q) {
  //   filter.product_name = q.toString();
  // }

  // if (category) {
  //   const storedCategory = await Category.findOne({ name: categoryName });
  //   if (category) {
  //     filter.category = storedCategory._id;
  //   } else {
  //     // Handle the case where the specified category does not exist
  //     return response.status(404).json({ error: 'Category not found' });
  //   }
  // }

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
    const products = await Product.find(filter).populate('category');
    response.status(200).json(products);
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

  if (
    !product_name ||
    !brand ||
    !description ||
    !price ||
    !category ||
    !main_image ||
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
    const addedProduct = await Product.create({
      product_name,
      brand,
      description,
      price,
      category,
      main_image,
      other_images,
      count_in_stock: count_in_stock as number,
    });
    return response.status(201).json(addedProduct);
  } catch (error: any) {
    console.log('[ADD_PRODUCT_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
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
