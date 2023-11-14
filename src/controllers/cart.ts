import express from 'express';
import Cart from '../models/cart';
import mongoose from 'mongoose';
import Product from '../models/product';

export const getUserCart = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user;

  try {
    const cart = await Cart.findOne({ user: user._id }).populate('user');

    if (!cart) {
      try {
        const newCart = await Cart.create({
          user: user._id,
          cart_items: [],
        });

        try {
          const newPopulatedCart = await Cart.findOne({
            user: user._id,
          }).populate('user');

          return response.status(201).json(newPopulatedCart);
        } catch (error: any) {
          console.log('[NEW_CART_FETCH_ERROR]', error);
          response.status(500).json({ error: 'Internal Server Error' });
        }
      } catch (error: any) {
        console.log('[CART_RECORD_CREATION_ERROR]', error);
        response.status(500).json({ error: 'Internal Server Error' });
      }
    }

    return response.status(200).json(cart);
  } catch (error: any) {
    console.log('[CART_FETCH_ERROR]', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const addToCart = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user;
  const { product } = request.body;

  if (!product) {
    return response
      .status(400)
      .json({ error: 'Please supply a product to add to cart' });
  }

  if (!mongoose.isValidObjectId(product)) {
    return response.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const productExists = await Product.findById(product);

    if (!productExists) {
      return response.status(404).json({ error: 'Product does not exist' });
    }

    try {
      const cart = await Cart.findOne({ user: user._id });

      if (!cart) {
        try {
          const newCart = await Cart.create({
            user: user._id,
            cart_items: [
              {
                product,
                quantity: 1,
              },
            ],
          });

          return response.status(201).json(newCart);
        } catch (error: any) {
          console.log('[CART_RECORD_CREATION_ERROR]', error);
          response.status(500).json({ error: 'Internal Server Error' });
        }
      }

      // check if item is already in cart
      const cart_items = cart?.cart_items;
      console.log(cart_items);

      const itemExistsInCart = cart_items?.find((item) => {
        // console.log('item.product', item.product);
        // console.log('product', product);
        return item.product.equals(product);
      });

      if (itemExistsInCart) {
        return response.status(400).json({ error: 'Product already in cart' });

        // TODO: probably add increment functionality in this same route

        // const updatedCart = await Cart.findOneAndUpdate(
        //   { user: user._id },
        //   {
        //     $set: { $inc: { 'cart_items.$[element].quantity': 1 } },
        //   },
        //   {
        //     new: true,
        //     arrayFilters: [{ 'element.product': product }],
        //   }
        // );
        // return response.status(200).json(updatedCart);
      }

      try {
        const updatedCart = await Cart.findOneAndUpdate(
          { user: user._id },
          { $push: { cart_items: { product, quantity: 1 } } },
          { new: true }
        );

        return response.status(200).json(updatedCart);
      } catch (error: any) {
        console.log('[CART_UPDATE_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (error: any) {
      console.log('[CART_FETCH_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[PRODUCT_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

// try {
//   const cart = await Cart.findOne({ user: user._id });

//   if (!cart) {
//     return response.status(404).json({ error: 'Cart not found' });
//   }

//   const { cart_items } = cart;

//   const itemExistsInCart = cart_items.find((item) => item.product === product);

//   if (itemExistsInCart) {
//     const updatedCart = await Cart.findOneAndUpdate(
//       { user: user._id },
//       {
//         $set: { $inc: { 'cart_items.$[element].quantity': 1 } },
//       },
//       {
//         new: true,
//         arrayFilters: [{ 'element.product': product }],
//       }
//     );

//     return response.status(200).json(updatedCart);
//   }

//   const updatedCart = await Cart.findOneAndUpdate(
//     { user: user._id },
//     { $push: { cart_items: { product, quantity: 1 } } }
//   );

//   return response.status(200).json(updatedCart);
// } catch (error: any) {
//   console.log('[CART_FETCH_ERROR]', error);
//   return response.status(500).json({ error: 'Internal Server Error' });
// }
