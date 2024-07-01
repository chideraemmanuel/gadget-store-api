import express from 'express';
import Billboard from '../models/billboard';
import paginateQuery from '../lib/helpers/paginateQuery';
import mongoose from 'mongoose';
// import upload from '../config/multer';
import fs from 'fs';
import getImageName from '../lib/helpers/getImageName';
import { billboardImageUpload } from '../config/multer';

interface Filters {
  // name?: any;
  // head_text?: any;
  // paragraph?: any;
}

export const getBillboards = async (
  request: express.Request,
  response: express.Response
) => {
  const { search_query, paginated, page, limit } = request.query;

  if (page && isNaN(page as any)) {
    return response.status(400).json({ error: 'Page should be a number.' });
  }

  if (limit && isNaN(limit as any)) {
    return response.status(400).json({ error: 'Limit should be a number.' });
  }

  // build filters based on query params
  const filter: Filters = {};
  let search;

  if (search_query) {
    // filter.name = { $regex: search_query as string, $options: 'i' };
    // filter.head_text = { $regex: search_query as string, $options: 'i' };
    // filter.paragraph = { $regex: search_query as string, $options: 'i' };

    const searchExpression = {
      $or: [
        { name: { $regex: search_query as string, $options: 'i' } },
        { head_text: { $regex: search_query as string, $options: 'i' } },
        { paragraph: { $regex: search_query as string, $options: 'i' } },
      ],
    };

    search = searchExpression;
  }

  // paginate query only if paginated is part of the query params
  if (paginated) {
    if (paginated !== 'true' && paginated !== 'false') {
      return response
        .status(400)
        .json({ error: 'Paginated must be a boolean value' });
    }

    if (paginated === 'true') {
      try {
        const paginationResponse = await paginateQuery({
          model: Billboard,
          response,
          filter: { ...search, ...filter },
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        });

        return paginationResponse;
      } catch (error: any) {
        console.log('[DATABASE_SEARCH_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  try {
    // const billboards = await Billboard.find(filter);
    const billboards = await Billboard.find({ ...search, ...filter });

    return response.status(200).json(billboards);
  } catch (error: any) {
    console.log('[DATABASE_SEARCH_ERROR]', error);
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
    console.log('[BILLBOARD_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createBillboard = async (
  request: express.Request,
  response: express.Response
) => {
  billboardImageUpload.single('billboard_image')(
    request,
    response,
    async (error) => {
      if (
        error?.code === 'LIMIT_FILE_COUNT' ||
        error?.code === 'LIMIT_UNEXPECTED_FILE'
      ) {
        console.log(error);
        // console.log(error?.message)
        return response.status(400).json({
          error: 'Billboard image should be a single file',
          errorCode: error?.code,
          errorMessage: error?.message,
        });
      }

      if (error) {
        return response.status(500).json({ error: error.message });
      }

      if (!request.file) {
        return response.status(400).json({
          error: 'Please supply the required product fields.',
        });
      }

      const billboard = request.body;

      const { name, head_text, paragraph, billboard_image } = billboard;

      const billboardImage = request.file;

      if (!name || !head_text || !billboardImage) {
        return response
          .status(400)
          .json({ error: 'Please supply the required fields' });
      }

      try {
        const createdBillboard = await Billboard.create({
          name,
          head_text,
          paragraph,
          billboard_image: `${process.env.PROJECT_BASE_URL}/public/assets/billboards/${billboardImage?.filename}`,
          // billboard_image: `http://localhost:5000/public/assets/${billboardImage?.filename}`,
        });

        return response.status(201).json(createdBillboard);
      } catch (error: any) {
        console.log('[BILLBOARD_CREATION_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );
};

interface BillboardUpdates {
  name?: string;
  head_text?: string;
  paragraph?: string;
  billboard_image?: string;
}

export const updateBillboard = (
  request: express.Request,
  response: express.Response
) => {
  billboardImageUpload.single('billboard_image')(
    request,
    response,
    async (error) => {
      if (
        error?.code === 'LIMIT_FILE_COUNT' ||
        error?.code === 'LIMIT_UNEXPECTED_FILE'
      ) {
        return response.status(400).json({
          error: 'Billboard image should be a single file',
          errorCode: error?.code,
          //  errorMessage: error?.message,
        });
      }

      if (error) {
        return response.status(500).json({ error: error.message });
      }

      // if (!request.file) {
      //   return response.status(400).json({
      //     error: 'Please supply the required product fields.',
      //   });
      // }

      const { id } = request.params;
      const billboard = request.body;

      console.log(billboard);

      const { name, head_text, paragraph, billboard_image } = billboard;

      console.log(name);

      if (!mongoose.isValidObjectId(id)) {
        // IF BILLBOARD ID IS INVALID, DELETE ALREADY UPLOADED IMAGE, IF ANY
        if (request.file) {
          try {
            await new Promise((resolve, reject) => {
              // fs.unlink(request.file?.filename!, (error) => {
              fs.unlink(
                `src/assets/billboards/${request.file?.filename!}`,
                (error) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve('');
                  }
                }
              );
            });
          } catch (error: any) {
            console.log('PREVIOUS_IMAGE_DELETION_ERROR', error);
            return response
              .status(500)
              .json({ error: 'Internal Server Error' });
          }
        }

        return response.status(400).json({ error: 'Invalid Billboard ID' });
      }

      // check if billboard exists
      try {
        const billboardExists = await Billboard.findById(id);

        if (!billboardExists) {
          // IF BILLBOARD DOES NOT EXIST, DELETE ALREADY UPLOADED IMAGE, IF ANY
          if (request.file) {
            try {
              await new Promise((resolve, reject) => {
                // fs.unlink(request.file?.filename!, (error) => {
                fs.unlink(
                  `src/assets/billboards/${request.file?.filename!}`,
                  (error) => {
                    if (error) {
                      reject(error);
                    } else {
                      resolve('');
                    }
                  }
                );
              });
            } catch (error: any) {
              console.log('PREVIOUS_IMAGE_DELETION_ERROR', error);
              return response
                .status(500)
                .json({ error: 'Internal Server Error' });
            }
          }

          return response
            .status(404)
            .json({ error: 'Billboard with the supplied ID does not exist' });
        }

        if (!name && !head_text && !paragraph && !request.file) {
          return response
            .status(400)
            .json({ error: 'No field to be edited was supplied' });
        }

        // build updates based on body data
        const updates: BillboardUpdates = {};

        if (name) {
          updates.name = name;
        }

        if (head_text) {
          updates.head_text = head_text;
        }

        if (paragraph) {
          updates.paragraph = paragraph;
        }

        if (request.file) {
          const billboardImage = request.file;

          updates.billboard_image = `${process.env.PROJECT_BASE_URL}/public/assets/billboards/${billboardImage?.filename}`;
          // updates.billboard_image = `${process.env.PROJECT_BASE_URL}/public/assets/${billboardImage?.filename}`;
        }

        console.log(updates);

        try {
          const session = await mongoose.startSession();

          try {
            const transactionResult = await session.withTransaction(
              async () => {
                if (updates.billboard_image) {
                  // IF A NEW IMAGE IS UPLOADED, DELETE PREVIOUSLY UPLOADED IMAGE, IF ANY
                  const imageUrls = [billboardExists.billboard_image];

                  const filePaths = imageUrls.map(
                    // (imageUrl) => `src/assets/billboards/${getImageName(imageUrl)}`
                    (imageUrl) =>
                      `src/assets/billboards/${getImageName(imageUrl)}`
                  );

                  const promises = filePaths.map((filePath) => {
                    return new Promise((resolve, reject) => {
                      fs.unlink(filePath, (error) => {
                        if (error) {
                          reject(error);
                        } else {
                          resolve('');
                        }
                      });
                    });
                  });

                  await Promise.all(promises);
                }

                const updatedBillboard = await Billboard.findByIdAndUpdate(
                  id,
                  updates,
                  { new: true, session }
                );

                return response.status(200).json(updatedBillboard);
              }
            );

            return transactionResult;
          } catch (error: any) {
            console.log('[TRANSACTION_ERROR]', error);
            return response
              .status(500)
              .json({ error: 'Internal Server Error' });
          } finally {
            await session.endSession();
          }
        } catch (error: any) {
          console.log('[SESSION_START_ERROR]', error);
          return response.status(500).json({ error: 'Internal Server Error' });
        }
      } catch (error: any) {
        console.log('[BILLBOARD_FETCH_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );
};

export const deleteBillboard = async (
  request: express.Request,
  response: express.Response
) => {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid Billboard ID' });
  }

  // check if billboard exists
  try {
    const billboardExists = await Billboard.findById(id);

    if (!billboardExists) {
      return response
        .status(404)
        .json({ error: 'Billboard with the supplied ID does not exist' });
    }

    try {
      const session = await mongoose.startSession();

      try {
        const transactionResult = await session.withTransaction(async () => {
          await Billboard.findByIdAndDelete(id, { session });

          const imageUrls = [billboardExists.billboard_image];

          const filePaths = imageUrls.map(
            // (imageUrl) => `src/assets/billboards/${getImageName(imageUrl)}`
            (imageUrl) => `src/assets/billboards/${getImageName(imageUrl)}`
          );

          const promises = filePaths.map((filePath) => {
            return new Promise((resolve, reject) => {
              fs.unlink(filePath, (error) => {
                if (error) {
                  reject(error);
                } else {
                  resolve('');
                }
              });
            });
          });

          await Promise.all(promises);

          return response
            .status(200)
            .json({ message: 'Billboard deleted successfully' });
        });

        return transactionResult;
      } catch (error: any) {
        console.log('[TRANSACTION_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      } finally {
        await session.endSession();
      }
    } catch (error: any) {
      console.log('[SESSION_START_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[BILLBOARD_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
