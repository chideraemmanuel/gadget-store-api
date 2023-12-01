import express, { NextFunction } from 'express';
import { verifyToken } from '../lib/helpers/token';
import User from '../models/user';

export const authenticate = async (
  request: express.Request,
  response: express.Response,
  next: NextFunction
) => {
  // const { token } = request.cookies;
  const token = request.cookies.token;

  if (!token) {
    return response.status(401).json({ error: 'Not authorized, no token' });
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    return response.status(401).json({ error: 'Not authorized' });
  }

  try {
    const user = await User.findById(decoded?.data);

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    // @ts-ignore
    request.user = user;

    next();
  } catch (error: any) {
    console.log('[AUTHENTICATION_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const verify = async (
  request: express.Request,
  response: express.Response,
  next: NextFunction
) => {
  // @ts-ignore
  const user = request.user;

  if (!user?.verified) {
    return response.status(401).json({ error: 'User not verified' });
  }

  next();
};

export const authorize = async (
  request: express.Request,
  response: express.Response,
  next: NextFunction
) => {
  // // @ts-ignore
  // const user = request.user;

  // if (!user) {
  //   return response.status(401).json({ error: 'Not authenticated' });
  // }

  // if (user?.role !== 'admin') {
  //   return response
  //     .status(403)
  //     .json({ error: 'Forbidden - Admin access required' });
  // }

  const admin_token = request.cookies.admin_token;

  if (!admin_token) {
    return response.status(401).json({ error: 'Unauthorized - No token' });
  }

  const decoded = await verifyToken(admin_token);

  if (!decoded) {
    return response
      .status(401)
      .cookie('admin_token', '', { maxAge: 1 })
      .json({ error: 'Unauthorized' });
  }

  try {
    const user = await User.findById(decoded?.data);

    if (!user) {
      return response
        .status(404)
        .cookie('admin_token', '', { maxAge: 1 })
        .json({ error: 'Admin not found' });
    }

    if (user.role !== 'admin') {
      return response
        .status(403)
        .json({ error: 'Forbidden - Admin access required' });
    }

    // next();
  } catch (error: any) {
    console.log('[USER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }

  next();
};
