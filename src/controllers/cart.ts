import express from 'express';
import Cart from '../models/cart';
import mongoose from 'mongoose';
import Product from '../models/product';

/**
 *
 * @desc  Get logged in user's cart items
 * @route  GET /cart
 * @access  Private
 */
export const getUserCart = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user; // COMES FROM AUTHENTICATE() MIDDLEWARE
  // const { populate } = request.query;

  try {
    // const cart =
    //   populate === 'true'
    //     ? await Cart.findOne({ user: user._id })
    //     : await Cart.findOne({ user: user._id });

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      try {
        const newUserCart = await Cart.create({
          user: user._id,
          cart_items: [],
        });

        return response.status(200).json(newUserCart);

        // try {
        //   const newPopulatedCart =
        //     populate === 'true'
        //       ? await Cart.findOne({ user: user._id })
        //       : await Cart.findOne({ user: user._id });

        //   return response.status(201).json(newPopulatedCart);
        // } catch (error: any) {
        //   console.log('[NEW_CART_FETCH_ERROR]', error);
        //   response.status(500).json({ error: 'Internal Server Error' });
        // }
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
      return response
        .status(404)
        .json({ error: 'Product with the supplied ID does not exist' });
    }

    try {
      const userCart = await Cart.findOne({ user: user._id });

      if (!userCart) {
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
      const cart_items = userCart?.cart_items;

      const itemExistsInCart = cart_items?.find((item) => {
        return item.product.equals(product);
      });

      if (itemExistsInCart) {
        return response.status(400).json({ error: 'Product already in cart' });
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

export const incrementItem = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user;
  const { product } = request.body;

  if (!product) {
    return response
      .status(400)
      .json({ error: 'Please supply a product to increment' });
  }

  if (!mongoose.isValidObjectId(product)) {
    return response.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const productExists = await Product.findById(product);

    if (!productExists) {
      return response
        .status(404)
        .json({ error: 'Product with the supplied ID does not exist' });
    }

    try {
      const userCart = await Cart.findOne({ user: user._id });

      if (!userCart) {
        try {
          await Cart.create({
            user: user._id,
            cart_items: [],
          });

          return response.status(400).json({ error: 'Item is not in cart' });
        } catch (error: any) {
          console.log('[CART_CREATION_ERROR]', error);
          return response.status(500).json({ error: 'Internal Server Error' });
        }
      }

      const { cart_items } = userCart;

      const itemExistsInCart = cart_items.find((item) =>
        item.product.equals(product)
      );

      if (!itemExistsInCart) {
        return response.status(400).json({ error: 'Item is not in cart' });
        // try {
        //   const updatedCart = await Cart.findOneAndUpdate(
        //     { user: user._id },
        //     { $push: { cart_items: { product, quantity: 1 } } },
        //     { new: true }
        //   );

        //   return response.status(200).json(updatedCart);
        // } catch (error: any) {
        //   console.log('[CART_UPDATE_ERROR]', error);
        //   return response.status(500).json({ error: 'Internal Server Error' });
        // }
      }

      // increment item here!
      const updatedCart = await Cart.findOneAndUpdate(
        { user: user._id },
        {
          $inc: { 'cart_items.$[element].quantity': 1 },
        },
        {
          new: true,
          arrayFilters: [{ 'element.product': product }],
        }
      );

      return response.status(200).json(updatedCart);
    } catch (error: any) {
      console.log('[CART_FETCH_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[PRODUCT_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const decrementItem = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user;
  const { product } = request.body;

  if (!product) {
    return response
      .status(400)
      .json({ error: 'Please supply a product to decrement' });
  }

  if (!mongoose.isValidObjectId(product)) {
    return response.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const productExists = await Product.findById(product);

    if (!productExists) {
      return response
        .status(404)
        .json({ error: 'Product with the supplied ID does not exist' });
    }

    try {
      const userCart = await Cart.findOne({ user: user._id });

      if (!userCart) {
        try {
          await Cart.create({
            user: user._id,
            cart_items: [],
          });

          return response.status(400).json({ error: 'Item is not in cart' });
        } catch (error: any) {
          console.log('[CART_CREATION_ERROR]', error);
          return response.status(500).json({ error: 'Internal Server Error' });
        }
      }

      const { cart_items } = userCart;

      const itemExistsInCart = cart_items.find((item) =>
        item.product.equals(product)
      );

      if (!itemExistsInCart) {
        return response.status(400).json({ error: 'Item is not in cart' });
      }

      if (itemExistsInCart.quantity === 1) {
        // remove item from cart
        const updatedCart = await Cart.findOneAndUpdate(
          { user: user._id },
          {
            $pull: { cart_items: { product } },
          },
          {
            new: true,
            // arrayFilters: [{ 'element.product': product }],
          }
        );

        return response.status(200).json(updatedCart);
      }

      // decrement item here!
      const updatedCart = await Cart.findOneAndUpdate(
        { user: user._id },
        {
          $inc: { 'cart_items.$[element].quantity': -1 },
        },
        {
          new: true,
          arrayFilters: [{ 'element.product': product }],
        }
      );

      return response.status(200).json(updatedCart);
    } catch (error: any) {
      console.log('[CART_FETCH_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[PRODUCT_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const removeFromCart = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user;
  const { product } = request.body;

  if (!product) {
    return response
      .status(400)
      .json({ error: 'Please supply a product to remove from cart' });
  }

  if (!mongoose.isValidObjectId(product)) {
    return response.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const productExists = await Product.findById(product);

    if (!productExists) {
      return response
        .status(400)
        .json({ error: 'Product with the supplied ID does not exist' });
    }

    try {
      // remove from cart
      const userCart = await Cart.findOne({ user: user._id });

      if (!userCart) {
        try {
          await Cart.create({
            user: user._id,
            cart_items: [],
          });

          return response.status(400).json({ error: 'Item is not in cart' });
        } catch (error: any) {
          console.log('[CART_CREATION_ERROR]', error);
          return response.status(500).json({ error: 'Internal Server Error' });
        }
      }

      const { cart_items } = userCart;

      const itemExistsInCart = cart_items.find((item) =>
        item.product.equals(product)
      );

      if (!itemExistsInCart) {
        return response.status(400).json({ error: 'Item is not in cart' });
      }

      // remove item from cart
      const updatedCart = await Cart.findOneAndUpdate(
        { user: user._id },
        {
          $pull: { cart_items: { product } },
        },
        {
          new: true,
          // arrayFilters: [{ 'element.product': product }],
        }
      );

      return response.status(200).json(updatedCart);
    } catch (error: any) {
      console.log('[CART_FETCH_ERROR]', error);
    }
  } catch (error: any) {
    console.log('[PRODUCT_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const clearCart = async (
  request: express.Request,
  response: express.Response
) => {
  // @ts-ignore
  const user = request.user;

  try {
    const userCart = await Cart.findOne({ user: user._id });

    if (!userCart) {
      try {
        await Cart.create({
          user: user._id,
          cart_items: [],
        });

        return response.status(400).json({ error: 'No items in cart' });
      } catch (error: any) {
        console.log('[CART_CREATION_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    }

    const { cart_items } = userCart;

    if (cart_items.length === 0) {
      return response.status(400).json({ error: 'No items in cart' });
    }

    try {
      const clearedCart = await Cart.findOneAndUpdate(
        { user: user._id },
        {
          $set: { cart_items: [] },
        },
        { new: true }
      );

      return response.status(200).json(clearedCart);
    } catch (error: any) {
      console.log('[CART_CLEAR_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[CART_FETCH_ERROR]');
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
