import express from 'express';
import Category from '../models/category';
import mongoose from 'mongoose';

export const getCategories = async (
  request: express.Request,
  response: express.Response
) => {
  try {
    const categories = await Category.find();
    return response.status(200).json(categories);
  } catch (error: any) {
    console.log('[CATEGORIES_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addCategory = async (
  request: express.Request,
  response: express.Response
) => {
  const { name } = request.body;

  if (!name) {
    return response
      .status(400)
      .json({ error: 'Please supply a category name' });
  }

  //   CHECK IF CATEGORY ALREADY EXISTS
  const categoryExists = await Category.find({ name: `${name}`.toLowerCase() });
  console.log(categoryExists);

  if (categoryExists.length > 0) {
    return response
      .status(400)
      .json({ error: `category ${name} already exists` });
  }

  try {
    const createdCategory = await Category.create({
      name: `${name}`.toLowerCase(),
    });
    return response.status(201).json(createdCategory);
  } catch (error: any) {
    console.log('[CATEGORY_CREATION_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

interface Updates {
  name?: string;
}

export const updateCategory = async (
  request: express.Request,
  response: express.Response
) => {
  const { id } = request.params;
  const { name } = request.body;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    const categoryExists = await Category.findById(id);

    if (!categoryExists) {
      return response
        .status(404)
        .json({ error: 'Category with the supplied ID does not exist.' });
    }

    if (!name) {
      return response
        .status(400)
        .json({ error: 'No field to be edited was supplied' });
    }

    // BUILD UPDATES BASED ON BODY DATA
    const updates: Updates = {};

    if (name) {
      updates.name = name;
    }

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
