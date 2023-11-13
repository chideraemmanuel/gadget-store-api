import jwt, { TokenExpiredError } from 'jsonwebtoken';

export const generateToken = (data: any) => {
  const token = jwt.sign({ data }, process.env.JWT_SECRET!);

  return token;
};

// export const verifyToken = (token: string) => {
//   let error: string | null = null;
//   const decoded = jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
//     if (err instanceof TokenExpiredError) {
//       error = 'Token has expired'
//       return
//     } else if (err) {
//       error = 'Invalid token'
//       return
//     }
//   })

//   return { decoded, error }
// }

export const verifyToken = async (token: string) => {
  return new Promise<{ data: string }>((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET!, (error, decoded) => {
      if (error instanceof TokenExpiredError) {
        reject({ error: 'Token has expired', stack: error });
      }
      if (error) {
        reject(error);
      }

      // @ts-ignore
      resolve(decoded);
    });
  });
};
