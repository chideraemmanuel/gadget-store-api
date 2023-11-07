import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import productsRouter from './routes/products';
import categoryRouter from './routes/categories';

dotenv.config();
const app = express();

const port = process.env.PORT || 5001;

// ENABLE BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ENABLE CORS
app.use(cors());

// CONNECT TO DATABASE
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to database');
  })
  .catch((error) => console.log('[DATABASE_CONNECTION_ERROR]', error?.message));

app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoryRouter);

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
