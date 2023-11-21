import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: true,
  },
  cart_items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        autopopulate: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
});

cartSchema.plugin(mongooseAutoPopulate);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
