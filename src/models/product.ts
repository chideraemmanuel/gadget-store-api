import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
    autopopulate: true,
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
    autopopulate: true,
  },
  product_image: {
    type: String,
    required: true,
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
  featured: {
    type: Boolean,
    default: false,
  },
});

productSchema.plugin(mongooseAutoPopulate);

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
