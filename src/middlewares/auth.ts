import express, { NextFunction } from 'express';
import { verifyToken } from '../lib/helpers/token';
import User from '../models/user';

const authMiddleware = async (
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

export default authMiddleware;
