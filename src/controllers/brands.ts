import express from 'express';
import paginateQuery from '../lib/helpers/paginateQuery';
import Brand from '../models/brand';
import mongoose from 'mongoose';
// import upload from '../config/multer';
import fs from 'fs';
import getImageName from '../lib/helpers/getImageName';
import { brandLogoUpload } from '../config/multer';

interface Filters {
  name?: any;
}

export const getBrands = async (
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

  if (search_query) {
    filter.name = { $regex: search_query as string, $options: 'i' };
  }

  // paginate query only if paginated is part of the query params
  if (paginated) {
    if (paginated !== 'true' && paginated !== 'false') {
      return response
        .status(400)
        .json({ error: 'Paginated must be a boolean value' });
    }

    try {
      const paginationResponse = await paginateQuery({
        model: Brand,
        response,
        filter,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      return paginationResponse;
    } catch (error: any) {
      console.log('[DATABASE_SEARCH_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  try {
    const brands = await Brand.find(filter);

    return response.status(200).json(brands);
  } catch (error: any) {
    console.log('[DATABASE_SEARCH_ERROR]', error.message);
    return response
      .status(500)
      .json({ error: 'Internal Server Error', m: error.message });
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

export const addBrand = async (
  request: express.Request,
  response: express.Response
) => {
  brandLogoUpload.single('brand_logo')(request, response, async (error) => {
    if (
      error?.code === 'LIMIT_FILE_COUNT' ||
      error?.code === 'LIMIT_UNEXPECTED_FILE'
    ) {
      return response.status(400).json({
        error: 'Product image should be a single file',
        errorCode: error?.code,
        //  errorMessage: error?.message,
      });
    }

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    // @ts-ignore
    if (!request.file) {
      return response.status(400).json({
        error: 'Please supply the required product fields.',
      });
    }

    const brand = request.body;

    console.log(brand);

    const { name, brand_logo } = brand;

    // @ts-ignore
    const brandLogo = request.file;

    if (!name || !brandLogo) {
      return response.status(400).json({
        error: 'Please supply the required product fields.',
      });
    }

    try {
      const addedBrand = await Brand.create({
        name,
        brand_logo: `http://localhost:5000/public/assets/brands/${brandLogo?.filename}`,
        // brand_logo: `http://localhost:5000/public/assets/${brandLogo?.filename}`,
      });

      return response.status(201).json(addedBrand);
    } catch (error: any) {
      console.log('[BRAND_CREATION_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

interface Updates {
  name?: string;
  brand_logo?: string;
}

export const updateBrand = async (
  request: express.Request,
  response: express.Response
) => {
  brandLogoUpload.single('brand_logo')(request, response, async (error) => {
    if (
      error?.code === 'LIMIT_FILE_COUNT' ||
      error?.code === 'LIMIT_UNEXPECTED_FILE'
    ) {
      return response.status(400).json({
        error: 'Brand image should be a single file',
        errorCode: error?.code,
      });
    }

    if (error) {
      return response.status(500).json({ error: error.message });
    }

    const { id } = request.params;
    const { name, brand_logo } = request.body;
    const brandLogo = request.file;

    if (!mongoose.isValidObjectId(id)) {
      // IF BRAND ID IS INVALID, DELETE ALREADY UPLOADED IMAGE, IF ANY
      if (request.file) {
        try {
          await new Promise((resolve, reject) => {
            // fs.unlink(request.file?.filename!, (error) => {
            fs.unlink(
              `src/assets/brands/${request.file?.filename!}`,
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
          return response.status(500).json({ error: 'Internal Server Error' });
        }
      }

      return response.status(400).json({ error: 'Invalid Brand ID' });
    }

    // check if brand exist
    try {
      const brandExists = await Brand.findById(id);

      if (!brandExists) {
        // IF BRAND DOES NOT EXIST, DELETE ALREADY UPLOADED IMAGE, IF ANY
        if (request.file) {
          try {
            await new Promise((resolve, reject) => {
              // fs.unlink(request.file?.filename!, (error) => {
              fs.unlink(
                `src/assets/brands/${request.file?.filename!}`,
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
          .json({ error: 'Brand with the supplied ID does not exist' });
      }

      if (!name && !brandLogo) {
        return response
          .status(400)
          .json({ error: 'No field to be edited was supplied' });
      }

      // build updates based on body data
      const updates: Updates = {};

      if (name) {
        updates.name = name;
      }

      if (brandLogo) {
        // updates.brand_logo = `http://localhost:5000/public/assets/${brandLogo?.filename}`;
        updates.brand_logo = `http://localhost:5000/public/assets/brands/${brandLogo?.filename}`;
      }

      console.log(updates);

      try {
        const session = await mongoose.startSession();

        try {
          const transactionResult = session.withTransaction(async () => {
            if (updates.brand_logo) {
              // IF A NEW IMAGE IS UPLOADED, DELETE PREVIOUSLY UPLOADED IMAGE, IF ANY
              const imageUrls = [brandExists.brand_logo];

              const filePaths = imageUrls.map(
                // (imageUrl) => `src/assets/products/${getImageName(imageUrl)}`
                (imageUrl) => `src/assets/brands/${getImageName(imageUrl)}`
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

            const updatedProduct = await Brand.findByIdAndUpdate(id, updates, {
              new: true,
              session,
            });

            return response.status(200).json(updatedProduct);
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
      console.log('[BRAND_FETCH_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

export const deleteBrand = async (
  request: express.Request,
  response: express.Response
) => {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid Brand ID' });
  }

  // check if brand exists
  try {
    const brandExists = await Brand.findById(id);

    if (!brandExists) {
      return response
        .status(404)
        .json({ error: 'Brand with the supplied ID does not exist' });
    }

    try {
      const session = await mongoose.startSession();

      try {
        const transactionResult = await session.withTransaction(async () => {
          await Brand.findByIdAndDelete(id, { session });

          const imageUrls = [brandExists.brand_logo];

          const filePaths = imageUrls.map(
            // (imageUrl) => `src/assets/brands/${getImageName(imageUrl)}`
            (imageUrl) => `src/assets/brands/${getImageName(imageUrl)}`
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
            .json({ message: 'Brand deleted successfully' });
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
    console.log('[BRAND_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
