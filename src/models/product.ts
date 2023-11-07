import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 1,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  main_image: {
    type: String,
    required: true,
  },
  other_images: {
    type: [String],
    default: [],
  },
  //   availability: {
  //     type: String,
  //     required: true,
  //   },
  count_in_stock: {
    type: Number,
    required: true,
    min: 0,
  },
});

const Product = mongoose.model('Product', productSchema);

export default Product;

// {
//   "product_name": "iPhone 13 Pro",
//   "brand": "Apple",
//   "description": "High-end smartphone with advanced camera features.",
//   "price": 999,
//   "category": "Phone",
//   "main_image": "http://localhost:5000/public/assets/phones/iPhone_13_pro.png",
//   "count_in_stock": 25
// }
