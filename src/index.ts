import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import productsRouter from './routes/products';
import categoryRouter from './routes/categories';

dotenv.config();
const app = express();

export const port = process.env.PORT || 5001;

// ENABLE BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ENABLE CORS
app.use(cors());

app.use('/public/assets/', express.static('src/assets'));

app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
);

// CONNECT TO DATABASE
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to database');
    // app.listen(port, () => {
    //   console.log(`Server started on http://localhost:${port}`);
    // });
  })
  .catch((error) => console.log('[DATABASE_CONNECTION_ERROR]', error));

app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoryRouter);

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
