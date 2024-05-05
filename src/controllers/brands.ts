import express from 'express';
import paginateQuery from '../lib/helpers/paginateQuery';
import Brand from '../models/brand';
import mongoose from 'mongoose';

interface Filters {
  name?: any;
}

export const getBrands = async (
  request: express.Request,
  response: express.Response
) => {
  const { search_query } = request.query;

  //   if (page && isNaN(page as any)) {
  //     return response.status(400).json({ error: 'Page should be a number.' });
  //   }

  //   if (limit && isNaN(limit as any)) {
  //     return response.status(400).json({ error: 'Limit should be a number.' });
  //   }

  // build filters based on query params
  const filter: Filters = {};

  if (search_query) {
    filter.name = { $regex: search_query as string, $options: 'i' };
  }

  try {
    // const pagiationResponse = await paginateQuery({
    //   model: Brand,
    //   response,
    //   page: parseInt(page as string),
    //   limit: parseInt(limit as string),
    // });

    // return pagiationResponse;

    const brands = Brand.find(filter);

    return response.status(200).json(brands);
  } catch (error: any) {
    console.log('[DATABASE_SEARCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSingleBrand = async (
  request: express.Request,
  response: express.Response
) => {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid Brand ID' });
  }

  try {
    const brand = await Brand.findById(id);

    if (!brand) {
      return response
        .status(404)
        .json({ error: 'Brand with the supplied ID dies not exist' });
    }

    return response.status(200).json(brand);
  } catch (error: any) {
    console.log('[BRAND_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
