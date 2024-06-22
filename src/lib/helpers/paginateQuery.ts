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
  // set max limit to 50
  const limitNumber = !limit ? 20 : limit > 50 ? 50 : limit;

  try {
    const data = await model
      .find(filter)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // total_records
    const total_records = await model.countDocuments(filter);
    // total_pages
    const total_pages = Math.ceil(total_records / limitNumber);
    // current_page
    const current_page = pageNumber;
    // previous_page
    const previous_page = pageNumber === 1 ? null : pageNumber - 1;
    // next_page
    const next_page =
      total_pages === 0 || pageNumber === total_pages ? null : pageNumber + 1;

    console.log('data', data);

    const result = {
      data,
      pagination: {
        total_records,
        total_pages,
        current_page,
        previous_page,
        next_page,
      },
    };

    console.log('returned result', result);

    return response.status(200).json(result);
  } catch (error: any) {
    console.log('[PAGINATION_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export default paginateQuery;
