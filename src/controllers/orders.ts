import express from 'express';
import paginateQuery from '../lib/helpers/paginateQuery';
import Order from '../models/order';
import mongoose from 'mongoose';

interface GetOrdersQueryParams {
  status?: 'pending' | 'shipped' | 'delivered';
}

export const getOrders = async (
  request: express.Request,
  response: express.Response
) => {
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

  // filter by user?
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

export const getSingleOrder = async (
  request: express.Request,
  response: express.Response
) => {
  const { orderId } = request.params;

  if (!mongoose.isValidObjectId(orderId)) {
    return response.status(400).json({ error: 'Invalid Order Id' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return response.status(404).json({ error: 'Order not found' });
    }

    return response.status(200).json(order);
  } catch (error: any) {
    console.log('[ORDER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

interface Updates {
  status?: 'pending' | 'shipped' | 'delivered';
}

export const updateOrder = async (
  request: express.Request,
  response: express.Response
) => {
  const { orderId } = request.params;
  const { status } = request.body;

  if (!mongoose.isValidObjectId(orderId)) {
    return response.status(400).json({ error: 'Invalid Order Id' });
  }

  // build updates
  const updates: Updates = {};

  if (!status) {
    return response
      .status(400)
      .json({ error: 'No field(s) to be updated was passed' });
  }

  if (status) {
    if (
      status !== 'pending' &&
      status !== 'shipped' &&
      status !== 'delivered'
    ) {
      return response.status(400).json({ error: 'Invalid "status" filter' });
    }

    updates.status = status;
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return response.status(404).json({ error: 'Order not found' });
    }

    try {
      const updatedOrder = await Order.findByIdAndUpdate(orderId, updates, {
        new: true,
      });

      return response.status(200).json(updatedOrder);
    } catch (error: any) {
      console.log('[ORDER_UPDATE_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[ORDER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
