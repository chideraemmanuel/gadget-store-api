import express from 'express';
import Category from '../models/category';

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
