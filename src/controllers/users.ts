import express from 'express';
import User from '../models/user';
import paginateQuery from '../lib/helpers/paginateQuery';

interface GetQueryParams {
  verified?: 'true' | 'false';
}

export const getUsers = async (
  request: express.Request,
  response: express.Response
) => {
  const { verified, page, limit } = request.query;

  if (page && isNaN(page as any)) {
    return response.status(400).json({ error: 'Page should be a number.' });
  }

  if (limit && isNaN(limit as any)) {
    return response.status(400).json({ error: 'Limit should be a number.' });
  }

  // build filters
  const filters: GetQueryParams = {};

  if (verified) {
    if (verified !== 'true' && verified !== 'false') {
      return response
        .status(400)
        .json({ error: 'Featured must be a boolean value' });
    }
    filters.verified = verified;
  }

  try {
    const paginatedRsponse = paginateQuery({
      model: User,
      response,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    return paginatedRsponse;
  } catch (error: any) {
    console.log('[USERS_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
