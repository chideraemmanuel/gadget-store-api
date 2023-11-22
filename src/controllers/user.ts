import express from 'express';
import { verifyToken } from '../lib/helpers/token';
import User from '../models/user';
import Order from '../models/order';
import paginateQuery from '../lib/helpers/paginateQuery';
import mongoose from 'mongoose';

export const getUser = async (
  request: express.Request,
  response: express.Response
) => {
  // const { token } = request.cookies;
  const token = request.cookies.token;
  //   @ts-ignore
  const user = request.user;

  return response.status(200).json({
    id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    verified: user.verified,
  });
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
  const user = request.user;

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
  const user = request.user;
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
  const user = request.user
  const { id } = request.params

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid Order Id'})
  }

  try {
    const order = Order.findOne({ user: user._id, _id: id})

    if(!order) {
      return response.status(404).json({ error: 'Order not found'})
    }

    
  } catch (error: any) {
    console.log('[ORDER_FETCH_ERROR]', error)
    return response.status(500).json({ error: 'Internal Server Error'})
  }
};
