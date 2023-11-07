import express from 'express';
import { products } from '../db';

export const getProducts = async (
  request: express.Request,
  response: express.Response
) => {
  const queryParams = request.query;
  console.log(queryParams?.q);

  if (queryParams?.q) {
    const filtered = products.filter((product) => {
      //   return (
      //     product.product_name.toLowerCase() ===
      //     queryParams?.q?.toString().toLowerCase()
      //   );
      return product.product_name
        .toLowerCase()
        .includes(queryParams?.q?.toString().toLowerCase() as string);
    });

    // console.log(filtered);

    return response.json(filtered);
  }

  //   console.log(products);
  return response.json(products);
};

// app.get('/api/products', (req, res) => {
//   let filteredProducts = [...products]; // Start with all products and filter down based on query params

//   const { category, price_range, brand, availability } = req.query;

//   // Apply filters based on query parameters
//   if (category) {
//     filteredProducts = filteredProducts.filter(
//       (product) => product.category === category
//     );
//   }

//   if (price_range) {
//     const [minPrice, maxPrice] = price_range.split('-').map(Number);
//     filteredProducts = filteredProducts.filter(
//       (product) => product.price >= minPrice && product.price <= maxPrice
//     );
//   }

//   if (brand) {
//     filteredProducts = filteredProducts.filter(
//       (product) => product.brand === brand
//     );
//   }

//   if (availability) {
//     const isAvailable = availability.toLowerCase() === 'true';
//     filteredProducts = filteredProducts.filter(
//       (product) => product.availability === isAvailable
//     );
//   }

//   // Return the filtered products
//   res.json(filteredProducts);
// });

// ************************************
// ************************************
// ************************************

// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/your-database-name', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const Product = mongoose.model('Product', {
//   name: String,
//   category: String,
//   price: Number,
//   brand: String,
//   availability: Boolean,
// });

// app.get('/api/products', async (req, res) => {
//   const { category, price_range, brand, availability } = req.query;

//   // Build the filter object based on query parameters
//   const filter = {};
//   if (category) filter.category = category;
//   if (price_range) {
//     const [minPrice, maxPrice] = price_range.split('-').map(Number);
//     filter.price = { $gte: minPrice, $lte: maxPrice };
//   }
//   if (brand) filter.brand = brand;
//   if (availability) filter.availability = availability.toLowerCase() === 'true';

//   try {
//     // Find products based on the filter object
//     const filteredProducts = await Product.find(filter);
//     res.json(filteredProducts);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
