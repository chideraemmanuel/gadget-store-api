import express from 'express';
import User from '../models/user';

// export const getUser = async (
//   request: express.Request,
//   response: express.Response
// ) => {
//   // @ts-ignore
//   const { requestUser } = request;
//   const { id } = request.params;

//   if (requestUser?.isAdimn) {
//     const user = await User.findById(id);

//     return;
//   }
// };
