import express from 'express';
import { verifyToken } from '../lib/helpers/token';
import User from '../models/user';

export const getUser = async (
  request: express.Request,
  response: express.Response
) => {
  // const { token } = request.cookies;
  const token = request.cookies.token;
  //   @ts-ignore
  const user = request.user;

  return response.status(200).json({
    id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    verified: user.verified,
  });

  //   if (!token) {
  //     return response.status(401).json({ error: 'Not authorized, no token' });
  //   }

  //   try {
  //     const decoded = await verifyToken(token);

  //     if (!decoded) {
  //       return response.status(401).json({ error: 'Not authorized' });
  //     }

  //     try {
  //       // @ts-ignore
  //       const user = await User.findById(decoded?.data);

  //       if (!user) {
  //         return response.status(404).json({ error: 'User not found' });
  //       }

  //       return response.status(200).json({
  //         id: user._id,
  //         first_name: user.first_name,
  //         last_name: user.last_name,
  //         email: user.email,
  //         verified: user.verified,
  //       });
  //     } catch (error: any) {
  //       console.log('[USER_FETCH_ERROR]', error);
  //       return response.status(500).json({ error: 'Internal Server Error' });
  //     }
  //   } catch (error: any) {
  //     console.log('[TOKEN_VERIFICATION_ERROR]', error);
  //     return response.status(500).json({ error: 'Internal Server Error' });
  //   }
};

interface Updates {
  first_name?: string;
  last_name?: string;
}

export const updateUser = async (
  request: express.Request,
  response: express.Response
) => {
  // const { token } = request.cookies
  const token = request.cookies.token;
  const { first_name, last_name } = request.body;
  // @ts-ignore
  const user = request.user;

  if (!first_name && !last_name) {
    return response
      .status(400)
      .json({ error: 'Field(s) to be updated not passed' });
  }

  // build updates
  const updates: Updates = {};

  if (first_name) {
    updates.first_name = first_name;
  }

  if (last_name) {
    updates.last_name = last_name;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
      new: true,
    });

    return response.status(200).json(updatedUser);
  } catch (error: any) {
    console.log('[USER_UPDATE_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

// export const getUserCart = async (
//   request: express.Request,
//   response: express.Response
// ) => {
//     // @ts-ignore
//     const user = request.user

//     try {
//         const cartItems = await User.findById(user._id).select('cart')
//     } catch (error: any) {

//     }
// };
