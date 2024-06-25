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

interface GetOrdersQueryParams {
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
  const filters: GetOrdersQueryParams = {};

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

  // filter by date range?

  try {
    const orders = await Order.find({ user: user._id });

    if (!orders || orders.length === 0) {
      return response.status(404).json({ error: 'No order found' });
    }

    const paginationResponse = await paginateQuery({
      model: Order,
      response,
      filter: filters,
      //  populate: populate === 'true' ? true : undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    // return response.status(200).json(orders);
    return paginationResponse;
  } catch (error: any) {
    console.log('[ORDERS_FETCH_ERROR]');
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSingleUserOrder = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user; // COMES FROM AUTHENTICATE MIDDLEWARE
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid Order Id' });
  }

  try {
    const order = Order.findOne({ user: user._id, _id: id });

    if (!order) {
      return response.status(404).json({ error: 'Order not found' });
    }
  } catch (error: any) {
    console.log('[ORDER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

// interface OrderItems {
//   product: string;
//   quantity: number;
//   shipping_address: string;
//   address: string;
//   postal_code: string;
//   city: string;
//   state: string;
//   country: string;
// }

// export const placeOrder = async (
//   request: express.Request,
//   response: express.Response
// ) => {
//   // @ts-ignore
//   const user = request.user; // COMES FROM AUTHENTICATE MIDDLEWARE

//   const { order_items } = request.body;

//   if (!Array.isArray(order_items)) {
//     return response
//       .status(400)
//       .json({ error: 'Order item(s) should be passed as an array' });
//   }

//   const order_items_array: OrderItems[] = order_items;

//   // loop through all order items and check if any invalid field was passed in
//   let appendedOrderItems = {} as OrderItems &
//     { status: string; order_date: number; total_price: number }[];

//   order_items_array.map(async (order_item) => {
//     const {
//       product,
//       quantity,
//       shipping_address,
//       address,
//       postal_code,
//       city,
//       state,
//       country,
//     } = order_item;

//     if (
//       product ||
//       quantity ||
//       shipping_address ||
//       address ||
//       postal_code ||
//       city ||
//       state ||
//       country
//     ) {
//       return response
//         .status(400)
//         .json({ error: 'Please provide all the required credentials' });
//     }

//     if (isNaN(quantity)) {
//       return response
//         .status(400)
//         .json({ error: 'Quantity should be a number' });
//     }

//     if (!mongoose.isValidObjectId(product)) {
//       return response.status(400).json({ error: 'Invalid Product ID' });
//     }

//     const productExists = await Product.findById(product);

//     if (!productExists) {
//       return response
//         .status(404)
//         .json({ error: 'Product with the supplied ID does not exist' });
//     }

//     // append status, order_date, and total_price to order_item
//     const newOrderItem = {
//       ...order_item,
//       status: 'pending',
//       order_date: Date.now(),
//       total_price: 1,
//     };

//     appendedOrderItems.push(newOrderItem);
//   });

//   console.log('appendedOrderItems:', appendedOrderItems);

//   // loop ended and no error was returned

//   try {
//     const userOrders = await Order.findOne({ user: user._id });

//     if (!userOrders) {
//       try {
//         const newOrder = await Order.create({
//           user: user._id,
//           order_items: appendedOrderItems,
//         });

//         return response.status(201).json(newOrder);
//       } catch (error: any) {
//         console.log('[ORDER_RECORD_CREATION_ERROR]', error);
//         return response.status(500).json({ error: 'Internal Server Error' });
//       }
//     }

//     const updatedOrder = await Order.findOneAndUpdate(
//       { user: user._id },
//       { $push: { order_items: { $each: appendedOrderItems } } },
//       { new: true }
//     );

//     return response.status(200).json(updatedOrder);
//   } catch (error: any) {
//     console.log('[ORDERS_FETCH_ERROR]');
//     return response.status(500).json({ error: 'Internal Server Error' });
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
  // order_id;
  // order_items;
  // shipping_address;
  // status;
  // order_date;
  // total_price;
  const { order_items, shipping_address } = request.body;

  if (!order_items) {
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

  order_items.forEach(async (order_item) => {
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
    populatedOrderItems.push({ product: productExists, quantity: quantity });
  });

  console.log('validOrderItems:', validOrderItems);
  console.log('populatedOrderItems:', populatedOrderItems);
  console.log('subTotal:', getSubTotal(populatedOrderItems));

  try {
    const userOrders = await Order.findOne({ user: user._id });

    if (!userOrders) {
      try {
        const newUserOrder = await Order.create({
          user: user._id,
          orders: [
            {
              order_id: uuid(),
              // order_items: order_items,
              order_items: validOrderItems,
              shipping_address: shipping_address,
              status: 'pending',
              order_date: Date.now(),
              total_price: getSubTotal(populatedOrderItems),
            },
          ],
        });

        return response.status(201).json(newUserOrder);
      } catch (error: any) {
        console.log('[ORDER_RECORD_CREATION_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    }

    try {
      const updatedOrder = await Order.findOneAndUpdate(
        { user: user._id },
        {
          $push: {
            orders: {
              order_id: uuid(),
              order_items: validOrderItems,
              shipping_address: shipping_address,
              status: 'pending',
              order_date: Date.now(),
              total_price: getSubTotal(populatedOrderItems),
            },
          },
        },
        { new: true }
      );

      return response.status(200).json(updatedOrder);
    } catch (error: any) {
      console.log('[ORDER_RECORD_UPDATE_ERROR]', error);
      return response.status(500).json('Internal Server Error');
    }
  } catch (error: any) {
    console.log('[USER_ORDER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const cancelOrder = async (
  request: express.Request,
  response: express.Response
) => {};
