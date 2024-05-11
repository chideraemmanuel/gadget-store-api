import express from 'express';
import Category from '../models/category';
import mongoose from 'mongoose';
import Billboard from '../models/billboard';

interface Filters {
  name?: any;
}

export const getCategories = async (
  request: express.Request,
  response: express.Response
) => {
  const { search_query } = request.query;

  const filter: Filters = {};

  if (search_query) {
    filter.name = { $regex: search_query as string, $options: 'i' };
  }

  try {
    const categories = await Category.find(filter);

    return response.status(200).json(categories);
  } catch (error: any) {
    console.log('[CATEGORIES_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSingleCategory = async (
  request: express.Request,
  response: express.Response
) => {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    const category = await Category.findById(id);

    if (!category) {
      return response
        .status(404)
        .json({ error: 'Category with the supplied category does not exist' });
    }

    return response.status(200).json(category);
  } catch (error: any) {
    console.log('[CATEGORY_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addCategory = async (
  request: express.Request,
  response: express.Response
) => {
  const { name, billboard } = request.body;

  // if (!name) {
  //   return response
  //     .status(400)
  //     .json({ error: 'Please supply a category name' });
  // }
  if (!name || !billboard) {
    return response
      .status(400)
      .json({ error: 'Please supply the required fields' });
  }

  if (!mongoose.isValidObjectId(billboard)) {
    return response.status(400).json({ error: 'Invalid billboard ID' });
  }

  // check if billboard exists
  try {
    const billboardExists = await Billboard.findById(billboard);

    if (!billboardExists) {
      return response
        .status(404)
        .json({ error: 'Billboard with the supplied ID does not exist' });
    }

    try {
      // //   CHECK IF CATEGORY ALREADY EXISTS
      // const categoryExists = await Category.find({
      //   name: `${name}`.toLowerCase(),
      // });
      // console.log(categoryExists);

      // if (categoryExists.length > 0) {
      //   return response
      //     .status(400)
      //     .json({ error: `category ${name} already exists` });
      // }

      //   CHECK IF CATEGORY ALREADY EXISTS
      const categoryExists = await Category.findOne({
        name: `${name}`.toLowerCase(),
      });

      console.log(categoryExists);

      if (categoryExists) {
        return response.status(400).json({
          error: `Category ${`${name}`.toUpperCase()} already exists`,
        });
      }

      try {
        const createdCategory = await Category.create({
          name: `${name}`.toLowerCase(),
          billboard,
        });

        return response.status(201).json(createdCategory);
      } catch (error: any) {
        console.log('[CATEGORY_CREATION_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (error: any) {
      console.log('[CATEGORY_FETCH_ERROR]');
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[BILLBOARD_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

interface Updates {
  name?: string;
  billboard?: string;
}

export const updateCategory = async (
  request: express.Request,
  response: express.Response
) => {
  const { id } = request.params;
  const { name, billboard } = request.body;

  if (!name || !billboard) {
    return response
      .status(400)
      .json({ error: 'No field to be edited was supplied' });
  }

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid category ID' });
  }

  if (!mongoose.isValidObjectId(billboard)) {
    return response.status(400).json({ error: 'Invalid billboard ID' });
  }

  // check if billboard exists
  try {
    const billboardExists = Billboard.findById(billboard);

    if (!billboardExists) {
      return response
        .status(404)
        .json({ error: 'Billboard with the supplied ID does not exist' });
    }

    // check if category exists
    try {
      const categoryExists = await Category.findById(id);

      if (!categoryExists) {
        return response
          .status(404)
          .json({ error: 'Category with the supplied ID does not exist.' });
      }

      // BUILD UPDATES BASED ON BODY DATA
      const updates: Updates = {};

      if (name) {
        updates.name = name;
      }

      if (billboard) {
        updates.billboard = billboard;
      }

      console.log(updates);

      try {
        const updatedCategory = await Category.findByIdAndUpdate(id, updates, {
          new: true,
        });

        return response.status(200).json(updatedCategory);
      } catch (error: any) {
        console.log('[CATEGORY_UPDATE_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (error: any) {
      console.log('[CATEGORY_FETCH_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[BILLBOARD_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteCategory = async (
  request: express.Request,
  response: express.Response
) => {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    const categoryExists = await Category.findById(id);

    if (!categoryExists) {
      return response
        .status(404)
        .json({ error: 'Category with the supplied ID does not exist' });
    }

    try {
      await Category.findByIdAndDelete(id);
      return response
        .status(400)
        .json({ message: 'Category deleted successfully' });
    } catch (error: any) {
      console.log('[CATEGORY_DELETION_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[CATEGORY_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
