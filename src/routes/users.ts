import express from 'express';
import { getSingleUser, getUsers, getUsersCount } from '../controllers/users';
// import { getUser } from '../controllers/users';

const router = express.Router();

// get all users (admin)
router.get('/', getUsers);
router.get('/:id', getSingleUser);
router.get('/count', getUsersCount);

export default router;
