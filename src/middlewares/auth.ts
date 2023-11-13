import express, { NextFunction } from 'express';

const authMiddleware = (
  request: express.Request,
  response: express.Response,
  next: NextFunction
) => {
  const { token } = request.cookies;
};

export default authMiddleware;
