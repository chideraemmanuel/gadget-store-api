import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { compareHash, hashData } from '../lib/helpers/hash';
import generateOtp from '../lib/helpers/generateOtp';
import Otp from '../models/otp';
import { generateToken } from '../lib/helpers/token';

interface UserTypes {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  auth_type: 'MANUAL' | 'GOOGLE';
}

export const registerUser = async (
  requset: express.Request,
  response: express.Response
) => {
  const { first_name, last_name, email, password } = requset.body;

  if (!first_name || !last_name || !email || !password) {
    return response
      .status(400)
      .json({ error: 'Please supply all the required credentials' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return response.status(400).json({ error: 'Email is already in use' });
    }

    try {
      const hashedPassword = await hashData(password);
      const createdUser = await User.create({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        auth_type: 'MANUAL',
      });

      try {
        const token = generateToken(createdUser._id);
        const otp = generateOtp();
        const hashedOtp = await hashData(otp);

        await Otp.create({
          email,
          otp: hashedOtp,
          createdAt: Date.now(),
          expiresAt: Date.now() + 3600000,
        });

        // TODO: send email with nodemailer

        return response
          .status(201)
          .cookie('token', token)
          .json({ message: `OTP has been sent to ${email}` });
      } catch (error: any) {
        console.log('[OTP_RECORD_CREATION_ERROR]', error);
        return response.status(500).json({ message: 'Internal Server Error' });
      }
    } catch (error: any) {
      console.log('[USER_CREATION_ERROR]', error);
      return response.status(500).json({ message: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[USER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const loginUser = async (
  requset: express.Request,
  response: express.Response
) => {
  const { email, password } = requset.body;

  if (!email || !password) {
    return response
      .status(400)
      .json({ error: 'Please supply the required credentials' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (!userExists) {
      return response
        .status(404)
        .json({ error: 'No user with the supplied email' });
    }

    if (userExists?.auth_type === 'GOOGLE') {
      return response.status(400).json({
        error:
          'Account already verified with Google. Sign in with Google instead.',
      });
    }

    const passwordMatches = await compareHash(password, userExists.password!);

    if (!passwordMatches) {
      return response.status(401).json({ error: 'Incorrect password' });
    }

    const token = generateToken(userExists._id);

    return response.status(200).cookie('token', token).json({
      id: userExists._id,
      first_name: userExists.first_name,
      last_name: userExists.last_name,
      email: userExists.email,
      verified: userExists.verified,
    });
  } catch (error: any) {
    console.log('[USER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const verifyUser = async (
  requset: express.Request,
  response: express.Response
) => {
  const { email, otp } = requset.body;

  if (!email || !otp) {
    return response
      .status(400)
      .json({ error: 'Please supply the required credentials' });
  }

  try {
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return response.status(404).json({ error: 'No OTP record found' });
    }

    // TODO: probably chech OTP expiry

    const otpMatches = await compareHash(otp, otpRecord.otp);

    if (!otpMatches) {
      return response.status(400).json({ error: 'Invalid OTP' });
    }

    try {
      await User.findOneAndUpdate({ email }, { verified: true });

      try {
        await Otp.findByIdAndDelete(otpRecord._id);

        return response
          .status(200)
          .json({ message: `Email (${email}) has been verified successfully` });
      } catch (error: any) {
        console.log('[OTP_RECORD_DELETION_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (error: any) {
      console.log('[USER_UPDATE_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[OTP_RECORD_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const resetOtp = async (
  request: express.Request,
  response: express.Response
) => {
  const { email } = request.body;

  if (!email) {
    return response
      .status(400)
      .json({ error: 'Please supply an email address' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (!userExists) {
      return response
        .status(404)
        .json({ error: 'No user with the suppplied email' });
    }

    if (userExists.verified) {
      return response
        .status(400)
        .json({ error: 'Email has already been verified' });
    }

    try {
      const otpRecord = await Otp.findOne({ email });

      if (otpRecord) {
        try {
          await Otp.deleteOne({ email });
        } catch (error: any) {
          console.log('[OTP_RECORD_DELETION_ERROR]', error);
          return response.status(500).json({ error: 'Internal Server Error' });
        }
      }

      try {
        const otp = generateOtp();
        const hashedOtp = hashData(otp);

        await Otp.create({
          email,
          otp: hashedOtp,
          createdAt: Date.now(),
          expiresAt: Date.now() + 3600000,
        });

        // TODO: resend otp logic

        return response
          .status(201)
          .json({ message: `OTP has been resent to ${email}` });
      } catch (error: any) {
        console.log('[OTP_RECORD_CREATION_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (error: any) {
      console.log('[OTP_RECORD_DELETION_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[USER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUser = async (
  request: express.Request,
  response: express.Response
) => {
  const { token } = request.cookies;

  if (!token) {
    return response.status(401).json({ error: 'Not authorized, no token' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!);

  if (!decoded) {
    return response.status(401).json({ error: 'Not authorized' });
  }

  try {
    // @ts-ignore
    const user = await User.findById(decoded?.id);

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    return response.status(200).json({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      verified: user.verified,
    });
  } catch (error: any) {
    console.log('[USER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
