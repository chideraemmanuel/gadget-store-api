import mongoose from 'mongoose';
import express from 'express';

// const pageSize = 10; // Number of items per page
// const pageNumber = req.query.pageNumber || 1; // Current page number (default to 1 if not provided)

// YourModel.find()
//   .skip((pageNumber - 1) * pageSize)
//   .limit(pageSize)
//   .exec((err, data) => {
//     if (err) {
//       // Handle error
//       return res.status(500).json({ error: err.message });
//     }
//     // Send paginated response to the client
//     res.json(data);
//   });

interface Params {
  model: mongoose.Model<any>;
  response: express.Response;
  filter?: any;
  page?: number;
  limit?: number;
}

const paginateQuery = async ({
  model,
  response,
  filter,
  page,
  limit,
}: Params) => {
  const pageNumber = page || 1;
  const limitNumber = limit || 10;

  try {
    const data = await model
      .find(filter)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    return response.status(200).json(data);
  } catch (error: any) {
    console.log('[PAGINATION_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export default paginateQuery;
