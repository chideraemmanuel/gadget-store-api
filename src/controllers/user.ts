import express from 'express';
import { verifyToken } from '../lib/helpers/token';
import User from '../models/user';
import Order from '../models/order';
import paginateQuery from '../lib/helpers/paginateQuery';
import mongoose from 'mongoose';
import Product from '../models/product';
import { PopulatedOrderItemTypes, getSubTotal } from '../lib/helpers/getTotals';
import { v4 as uuid } from 'uuid';

export const getUser = async (
  request: express.Request,
  response: express.Response
) => {
  // const { token } = request.cookies;
  const token = request.cookies.token;
  //   @ts-ignore

  const user = request.user; // COMES FROM AUTHENTICATE() MIDDLEWARE

  return response.status(200).json(user);
};

interface Updates {
  first_name?: string;
  last_name?: string;
}

export const updateUser = async (
  request: express.Request,
  response: express.Response
) => {
  // const { token } = request.cookies
  const token = request.cookies.token;
  const { first_name, last_name } = request.body;
  // @ts-ignore
  const user = request.user; // COMES FROM AUTHENTICATE MIDDLEWARE

  if (!first_name && !last_name) {
    return response
      .status(400)
      .json({ error: 'Field(s) to be updated not passed' });
  }

  // build updates
  const updates: Updates = {};

  if (first_name) {
    updates.first_name = first_name;
  }

  if (last_name) {
    updates.last_name = last_name;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
      new: true,
    });

    return response.status(200).json(updatedUser);
  } catch (error: any) {
    console.log('[USER_UPDATE_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

// interface GetOrdersQueryParams {
//   status?: 'pending' | 'shipped' | 'delivered';
// }

// interface GetOrdersQueryParams {
//   'orders.status'?: 'pending' | 'shipped' | 'delivered';
// }

// export const getUserOrders = async (
//   request: express.Request,
//   response: express.Response
// ) => {
//   // @ts-ignore
//   const user = request.user; // COMES FROM AUTHENTICATE MIDDLEWARE
//   // const { status, page, limit } = request.query;
//   const { status } = request.query;

//   // if (page && isNaN(page as any)) {
//   //   return response.status(400).json({ error: 'Page should be a number.' });
//   // }

//   // if (limit && isNaN(limit as any)) {
//   //   return response.status(400).json({ error: 'Limit should be a number.' });
//   // }

//   // build filters
//   // const filters: GetOrdersQueryParams = {};

//   // if (status) {
//   //   if (
//   //     status !== 'pending' &&
//   //     status !== 'shipped' &&
//   //     status !== 'delivered'
//   //   ) {
//   //     return response.status(400).json({ error: 'Invalid "status" filter' });
//   //   }

//   //   filters['orders.status'] = status;
//   // }

//   // filter by date range?

//   try {
//     const orderRecord = await Order.findOne({ user: user._id });

//     if (!orderRecord) {
//       const newOrderRecord = await Order.create({
//         user: user._id,
//         orders: [],
//       });

//       return response.status(201).json(newOrderRecord);
//     }

//     if (status) {
//       if (
//         status !== 'pending' &&
//         status !== 'shipped' &&
//         status !== 'delivered'
//       ) {
//         return response.status(400).json({ error: 'Invalid "status" filter' });
//       }

//       const requestedOrders = orderRecord.orders.filter(
//         (item) => item.status === status
//       );

//       if (!requestedOrders || requestedOrders.length === 0) {
//         return response.status(200).json({
//           user: user._id,
//           orders: [],
//         });
//       }

//       return response.status(200).json({
//         user: user._id,
//         orders: requestedOrders,
//       });
//     }

//     return response.status(201).json(orderRecord);

//     // @ts-ignore
//     // if (orderRecord?.orders?.length === 0) {
//     //   return response.status(201).json(orderRecord);
//     // }

//     // const paginationResponse = await paginateQuery({
//     //   model: Order,
//     //   response,
//     //   filter: filters,
//     //   //  populate: populate === 'true' ? true : undefined,
//     //   page: parseInt(page as string),
//     //   limit: parseInt(limit as string),
//     // });

//     // return paginationResponse;
//   } catch (error: any) {
//     console.log('[ORDERS_FETCH_ERROR]');
//     return response.status(500).json({ error: 'Internal Server Error' });
//   }
// };

interface GetOrdersQueryParams {
  user: string;
  status?: 'pending' | 'shipped' | 'delivered';
}

export const getUserOrders = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user; // COMES FROM AUTHENTICATE MIDDLEWARE
  const { status, page, limit } = request.query;

  if (page && isNaN(page as any)) {
    return response.status(400).json({ error: 'Page should be a number.' });
  }

  if (limit && isNaN(limit as any)) {
    return response.status(400).json({ error: 'Limit should be a number.' });
  }

  // build filters
  const filters: GetOrdersQueryParams = { user: user._id };

  if (status) {
    if (
      status !== 'pending' &&
      status !== 'shipped' &&
      status !== 'delivered'
    ) {
      return response.status(400).json({ error: 'Invalid "status" filter' });
    }

    filters.status = status;
  }

  console.log({ filters });

  // filter by date range?

  try {
    const paginationResponse = await paginateQuery({
      model: Order,
      response,
      filter: filters,
      //  populate: populate === 'true' ? true : undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    return paginationResponse;
  } catch (error: any) {
    console.log('[ORDERS_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

// export const getSingleUserOrder = async (
//   request: express.Request,
//   response: express.Response
// ) => {
//   // @ts-ignore
//   const user = request.user; // COMES FROM AUTHENTICATE MIDDLEWARE
//   const { orderId } = request.params;

//   // if (!mongoose.isValidObjectId(orderId)) {
//   //   return response.status(400).json({ error: 'Invalid Order Id' });
//   // }

//   try {
//     const order = await Order.findOne({ user: user._id });

//     if (!order || order.orders.length === 0) {
//       return response.status(404).json({ error: 'Order not found' });
//     }

//     const requestedOrder = order.orders.find(
//       (item) => item.order_id === orderId
//     );

//     if (!requestedOrder) {
//       return response.status(404).json({ error: 'Order not found' });
//     }

//     return response.status(200).json({
//       user: user._id,
//       order: requestedOrder,
//     });
//   } catch (error: any) {
//     console.log('[ORDER_FETCH_ERROR]', error);
//     return response.status(500).json({ error: 'Internal Server Error' });
//   }
// };

export const getSingleUserOrder = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user; // COMES FROM AUTHENTICATE MIDDLEWARE
  const { orderId } = request.params;

  if (!mongoose.isValidObjectId(orderId)) {
    return response.status(400).json({ error: 'Invalid Order Id' });
  }

  try {
    const order = await Order.findOne({ user: user._id, _id: orderId });

    if (!order) {
      return response.status(404).json({ error: 'Order not found' });
    }

    return response.status(200).json(order);
  } catch (error: any) {
    console.log('[ORDER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

// interface OrderItems {
//   product: string;
//   quantity: number;
// }

// export const placeOrder = async (
//   request: express.Request,
//   response: express.Response
// ) => {
//   // @ts-ignore
//   const user = request.user; // COMES FROM AUTHENTICATE MIDDLEWARE
//   // order_id;
//   // order_items;
//   // shipping_address;
//   // status;
//   // order_date;
//   // total_price;
//   const { order_items, shipping_address } = request.body;

//   if (!order_items || order_items.length === 0) {
//     return response.status(400).json({
//       error:
//         'Please provide an array of order item(s) with the required fields.',
//     });
//   }

//   if (!shipping_address) {
//     return response
//       .status(400)
//       .json({ error: 'Please provide a shipping address.' });
//   }

//   const { receipent_name, address, postal_code, city, state, country } =
//     shipping_address;

//   if (
//     !receipent_name ||
//     !address ||
//     !postal_code ||
//     !city ||
//     !state ||
//     !country
//   ) {
//     return response.status(400).json({
//       error: 'Please provide the required details for the shipping address',
//     });
//   }

//   if (!Array.isArray(order_items)) {
//     return response
//       .status(400)
//       .json({ error: 'Order item(s) should be passed as an array' });
//   }

//   // const order_items_array: OrderItems[] = order_items;

//   // initialized variable to store order items that makes it through the array iteration below.
//   // though redundant, this makes the code more understandable, as the *successful* order items are added to the array at the end of each iteration
//   let validOrderItems = [] as OrderItems[];

//   // initialize variable to store order items with populated product field
//   // this is to be used to calculate the total price of the order
//   let populatedOrderItems = [] as PopulatedOrderItemTypes[];

//   // order_items.forEach(async (order_item) => {
//   //   const { product, quantity } = order_item;

//   //   if (!product || !quantity) {
//   //     return response
//   //       .status(400)
//   //       .json({ error: 'Please provide the required product details' });
//   //   }

//   //   if (isNaN(quantity)) {
//   //     return response
//   //       .status(400)
//   //       .json({ error: 'Quantity should be a number' });
//   //   }

//   //   if (!mongoose.isValidObjectId(product)) {
//   //     return response.status(400).json({ error: 'Invalid Product ID' });
//   //   }

//   //   const productExists = await Product.findById(product);

//   //   if (!productExists) {
//   //     return response
//   //       .status(404)
//   //       .json({ error: 'Product with the supplied ID does not exist' });
//   //   }

//   //   validOrderItems.push(order_item);
//   //   populatedOrderItems.push({ product: productExists, quantity: quantity });
//   // });

//   try {
//     // USES FOR OF LOOP IN PLACE OF FOREACH, AS FOREACH DOESN'T HANDLE ASYNCHRONOUS OPERATIONS WELL
//     for (const order_item of order_items) {
//       const { product, quantity } = order_item;

//       if (!product || !quantity) {
//         return response
//           .status(400)
//           .json({ error: 'Please provide the required product details' });
//       }

//       if (isNaN(quantity)) {
//         return response
//           .status(400)
//           .json({ error: 'Quantity should be a number' });
//       }

//       if (!mongoose.isValidObjectId(product)) {
//         return response.status(400).json({ error: 'Invalid Product ID' });
//       }

//       const productExists = await Product.findById(product);

//       if (!productExists) {
//         return response
//           .status(404)
//           .json({ error: 'Product with the supplied ID does not exist' });
//       }

//       validOrderItems.push(order_item);
//       populatedOrderItems.push({ product: productExists, quantity });
//     }

//     // Process the valid order items (e.g., save to database)
//     // ...
//     console.log('validOrderItems:', validOrderItems);
//     console.log('populatedOrderItems:', populatedOrderItems);
//     console.log('subTotal:', getSubTotal(populatedOrderItems));

//     try {
//       const userOrders = await Order.findOne({ user: user._id });

//       if (!userOrders) {
//         try {
//           const newUserOrder = await Order.create({
//             user: user._id,
//             orders: [
//               {
//                 order_id: uuid(),
//                 // order_items: order_items,
//                 order_items: validOrderItems,
//                 shipping_address: shipping_address,
//                 status: 'pending',
//                 order_date: Date.now(),
//                 total_price: getSubTotal(populatedOrderItems),
//               },
//             ],
//           });

//           return response.status(201).json(newUserOrder);
//         } catch (error: any) {
//           console.log('[ORDER_RECORD_CREATION_ERROR]', error);
//           return response.status(500).json({ error: 'Internal Server Error' });
//         }
//       }

//       try {
//         const updatedOrder = await Order.findOneAndUpdate(
//           { user: user._id },
//           {
//             $push: {
//               orders: {
//                 order_id: uuid(),
//                 order_items: validOrderItems,
//                 shipping_address: shipping_address,
//                 status: 'pending',
//                 order_date: Date.now(),
//                 total_price: getSubTotal(populatedOrderItems),
//               },
//             },
//           },
//           { new: true }
//         );

//         return response.status(200).json(updatedOrder);
//       } catch (error: any) {
//         console.log('[ORDER_RECORD_UPDATE_ERROR]', error);
//         return response.status(500).json('Internal Server Error');
//       }
//     } catch (error: any) {
//       console.log('[USER_ORDER_FETCH_ERROR]', error);
//       return response.status(500).json({ error: 'Internal Server Error' });
//     }
//   } catch (error) {
//     console.error('Error processing order:', error);
//     return response.status(500).json({ error: 'Internal server error' });
//   }
// };

interface OrderItems {
  product: string;
  quantity: number;
}

export const placeOrder = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user; // COMES FROM AUTHENTICATE MIDDLEWARE

  const { order_items, shipping_address } = request.body;

  if (!order_items || order_items.length === 0) {
    return response.status(400).json({
      error:
        'Please provide an array of order item(s) with the required fields.',
    });
  }

  if (!shipping_address) {
    return response
      .status(400)
      .json({ error: 'Please provide a shipping address.' });
  }

  const { receipent_name, address, postal_code, city, state, country } =
    shipping_address;

  if (
    !receipent_name ||
    !address ||
    !postal_code ||
    !city ||
    !state ||
    !country
  ) {
    return response.status(400).json({
      error: 'Please provide the required details for the shipping address',
    });
  }

  if (!Array.isArray(order_items)) {
    return response
      .status(400)
      .json({ error: 'Order item(s) should be passed as an array' });
  }

  // const order_items_array: OrderItems[] = order_items;

  // initialized variable to store order items that makes it through the array iteration below.
  // though redundant, this makes the code more understandable, as the *successful* order items are added to the array at the end of each iteration
  let validOrderItems = [] as OrderItems[];

  // initialize variable to store order items with populated product field
  // this is to be used to calculate the total price of the order
  let populatedOrderItems = [] as PopulatedOrderItemTypes[];

  // order_items.forEach(async (order_item) => {
  //   const { product, quantity } = order_item;

  //   if (!product || !quantity) {
  //     return response
  //       .status(400)
  //       .json({ error: 'Please provide the required product details' });
  //   }

  //   if (isNaN(quantity)) {
  //     return response
  //       .status(400)
  //       .json({ error: 'Quantity should be a number' });
  //   }

  //   if (!mongoose.isValidObjectId(product)) {
  //     return response.status(400).json({ error: 'Invalid Product ID' });
  //   }

  //   const productExists = await Product.findById(product);

  //   if (!productExists) {
  //     return response
  //       .status(404)
  //       .json({ error: 'Product with the supplied ID does not exist' });
  //   }

  //   validOrderItems.push(order_item);
  //   populatedOrderItems.push({ product: productExists, quantity: quantity });
  // });

  try {
    // uses for of loop in place of forEach, as forEach doesn't handle asynchronous operations well
    for (const order_item of order_items) {
      const { product, quantity } = order_item;

      if (!product || !quantity) {
        return response
          .status(400)
          .json({ error: 'Please provide the required product details' });
      }

      if (isNaN(quantity)) {
        return response
          .status(400)
          .json({ error: 'Quantity should be a number' });
      }

      if (!mongoose.isValidObjectId(product)) {
        return response.status(400).json({ error: 'Invalid Product ID' });
      }

      const productExists = await Product.findById(product);

      if (!productExists) {
        return response
          .status(404)
          .json({ error: 'Product with the supplied ID does not exist' });
      }

      validOrderItems.push(order_item);
      populatedOrderItems.push({ product: productExists, quantity });
    }

    console.log('validOrderItems:', validOrderItems);
    console.log('populatedOrderItems:', populatedOrderItems);
    console.log('subTotal:', getSubTotal(populatedOrderItems));

    try {
      const createdOrder = await Order.create({
        user: user._id,
        order_items: validOrderItems,
        shipping_address: shipping_address,
        status: 'pending',
        order_date: Date.now(),
        total_price: getSubTotal(populatedOrderItems),
      });

      return response.status(201).json(createdOrder);
    } catch (error: any) {
      console.log('[ORDER_RECORD_CREATION_ERROR]', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.log('[ORDER_VALIDATION_ERROR]', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
};

// export const cancelOrder = async (
//   request: express.Request,
//   response: express.Response
// ) => {
//   // @ts-ignore
//   const user = request.user; // COMES FROM AUTHENTICATE MIDDLEWARE
//   const { orderId } = request.params;

//   try {
//     const orderRecord = await Order.findOne({
//       user: user._id,
//       'orders.order_id': orderId,
//     });

//     if (!orderRecord || orderRecord.orders.length === 0) {
//       return response.status(404).json({ error: 'Order not found' });
//     }

//     const orderToCancel = orderRecord.orders.find(
//       (item) => item.order_id === orderId
//     );

//     if (!orderToCancel) {
//       return response.status(404).json({ error: 'Order not found' });
//     }

//     if (
//       orderToCancel.status === 'shipped' ||
//       orderToCancel.status === 'delivered'
//     ) {
//       return response.status(400).json({
//         error: 'Orders that have been shipped or delivered cannot be cancelled',
//       });
//     }

//     try {
//       const updatedOrderRecord = await Order.findOneAndUpdate(
//         { user: user._id },
//         // can fetch with dot notation, but can't update with dot notation
//         // { $pull: { 'orders.order_id': orderId } },
//         { $pull: { orders: { order_id: orderId } } },
//         { new: true }
//       );

//       return response
//         .status(200)
//         .json({ message: 'Order Cancelled Successfully' });
//     } catch (error: any) {
//       console.log('[ORDER_UPDATE_ERROR]', error);
//       return response.status(500).json({ error: 'Internal Server Error' });
//     }
//   } catch (error: any) {
//     console.log('[ORDER_FETCH_ERROR]', error);
//     return response.status(500).json({ error: 'Internal Server Error' });
//   }
// };

export const cancelOrder = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user; // COMES FROM AUTHENTICATE MIDDLEWARE
  const { orderId } = request.params;

  if (!mongoose.isValidObjectId(orderId)) {
    return response.status(400).json({ error: 'Invalid Order Id' });
  }

  try {
    const orderToCancel = await Order.findOne({ user: user._id, _id: orderId });

    if (!orderToCancel) {
      return response.status(404).json({ error: 'Order not found' });
    }

    if (
      orderToCancel.status === 'shipped' ||
      orderToCancel.status === 'delivered'
    ) {
      return response.status(400).json({
        error: 'Orders that have been shipped or delivered cannot be cancelled',
      });
    }

    try {
      await Order.findByIdAndDelete(orderId);

      return response
        .status(200)
        .json({ message: 'Order Cancelled Successfully' });
    } catch (error: any) {
      console.log('[ORDER_DELETION_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[ORDER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
