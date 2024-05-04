import express from 'express';
import Billboard from '../models/billboard';
import paginateQuery from '../lib/helpers/paginateQuery';
import mongoose from 'mongoose';
import upload from '../config/multer';

interface GetQueryParams {
  name?: any;
  head_text?: any;
  paragraph?: any;
}

export const getBillboards = async (
  request: express.Request,
  response: express.Response
) => {
  const { search_query, page, limit } = request.query;

  if (page && isNaN(page as any)) {
    return response.status(400).json({ error: 'Page should be a number.' });
  }

  if (limit && isNaN(limit as any)) {
    return response.status(400).json({ error: 'Limit should be a number.' });
  }

  // build filters based on query params
  const filter: GetQueryParams = {};

  if (search_query) {
    filter.name = { $regex: search_query as string, $options: 'i' };
    // filter.head_text = { $regex: search_query as string, $options: 'i' };
    // filter.paragraph = { $regex: search_query as string, $options: 'i' };
  }

  try {
    const pagiationResponse = await paginateQuery({
      model: Billboard,
      response,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    return pagiationResponse;
  } catch (error: any) {
    console.log('DATABASE_SEARCH_ERROR', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSingleBillboard = async (
  request: express.Request,
  response: express.Response
) => {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid Billboard ID' });
  }

  try {
    const billboard = await Billboard.findById(id);

    if (!billboard) {
      return response
        .status(404)
        .json({ error: 'Billboard with the supplied ID dies not exist' });
    }

    return response.status(200).json(billboard);
  } catch (error: any) {
    console.log('BILLBOARD_FETCH_ERROR', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
