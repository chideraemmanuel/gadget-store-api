import express, { NextFunction } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import productsRouter from './routes/products';
import categoriesRouter from './routes/categories';
import billboardsRouter from './routes/billboard';
import usersRouter from './routes/users';
import ordersRouter from './routes/orders';
import userRouter from './routes/user';
import cartRouter from './routes/cart';
import authRouter from './routes/auth';
import transporter from './config/nodemailer';
import { authenticate, authorize, verify } from './middlewares/auth';

dotenv.config();
const app = express();

export const port = process.env.PORT || 5001;

// ENABLE BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  (
    request: express.Request,
    response: express.Response,
    next: NextFunction
  ) => {
    response.header({
      'Access-Control-Allow-Credentials': true,
      // 'Access-Control-Allow-Origin': 'http://localhost:3000',
    });

    // response.setHeader('Access-Control-Allow-Credentials', 'true');
    // response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    next();
  }
);

// ENABLE CORS
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

// ENABLE COOKIE PARSER
app.use(cookieParser());

app.use(morgan('tiny'));

app.use('/public/assets/', express.static('src/assets'));

app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (error) {
      return res.status(500).json({ error: error.message, stack: error.stack });
    }
  }
);

// transporter.verify((error, success) => {
//   if (error) {
//     console.log('error configuring nodemailer', error);
//   } else {
//     console.log('succesfully configured nodemailer', success);
//   }
// });

console.log(process.env.MONGODB_URI!);

// CONNECT TO DATABASE
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to database');
    app.listen(port, () => {
      console.log(`Server started on http://localhost:${port}`);
    });
  })
  .catch((error) => console.log('[DATABASE_CONNECTION_ERROR]', error));

app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/billboards', billboardsRouter);
app.use('/api/v1/users', authorize, usersRouter);
app.use('/api/v1/orders', authorize, ordersRouter);
app.use('/api/v1/user', authenticate, userRouter);
app.use('/api/v1/cart', authenticate, verify, cartRouter);
app.use('/api/v1/auth', authRouter);

// app.listen(port, () => {
//   console.log(`Server started on http://localhost:${port}`);
// });
