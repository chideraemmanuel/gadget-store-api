import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

// const ordersSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     autopopulate: true,
//   },
//   orders: [
//     {
//       order_id: {
//         type: String,
//         required: true,
//         unique: true,
//       },
//       order_items: [
//         {
//           product: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Product',
//             required: true,
//             autopopulate: true,
//           },
//           quantity: {
//             type: Number,
//             required: true,
//             min: 0,
//           },
//         },
//       ],
//       shipping_address: {
//         receipent_name: {
//           type: String,
//           required: true,
//         },
//         address: {
//           type: String,
//           required: true,
//         },
//         postal_code: {
//           type: String,
//         },
//         city: {
//           type: String,
//           required: true,
//         },
//         state: {
//           type: String,
//           required: true,
//         },
//         country: {
//           type: String,
//           required: true,
//         },
//       },
//       status: {
//         type: String,
//         default: 'pending',
//         enum: ['pending', 'shipped', 'delivered'],
//       },
//       order_date: {
//         type: Date,
//         required: true,
//       },
//       total_price: {
//         type: Number,
//         required: true,
//       },
//     },
//   ],
// });

const ordersSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // autopopulate: true,
  },

  order_items: [
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
        min: 1,
      },
    },
  ],

  shipping_address: {
    receipent_name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    postal_code: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'shipped', 'delivered'],
  },
  order_date: {
    type: Date,
    required: true,
  },
  total_price: {
    type: Number,
    required: true,
  },
});

ordersSchema.plugin(mongooseAutoPopulate);

const Order = mongoose.model('Order', ordersSchema);

export default Order;
