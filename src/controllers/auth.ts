import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { compareHash, hashData } from '../lib/helpers/hash';
import generateOtp from '../lib/helpers/generateOtp';
import Otp from '../models/otp';
import { generateToken, verifyToken } from '../lib/helpers/token';
import sendEmail from '../lib/helpers/sendEmail';

export const registerUser = async (
  request: express.Request,
  response: express.Response
) => {
  const { first_name, last_name, email, password } = request.body;

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

        try {
          // const info = await sendEmail({
          //   receipent: email,
          //   subject: 'Email Verification',
          //   html: `<p>Your OTP is ${otp}</p>`,
          // });
          // console.log('Mail sent!', info.messageId);
          return response
            .status(201)
            .cookie('token', token)
            .json({
              user: {
                id: createdUser._id,
                first_name: createdUser.first_name,
                last_name: createdUser.last_name,
                email: createdUser.email,
                verified: createdUser.verified,
                user: createdUser.role,
              },
              message: `OTP has been sent to ${email}`,
            });
        } catch (error: any) {
          console.log('[EMAIL_SENDING_ERROR]', error);
          return response.status(500).json({ error: 'Internal Server Error' });
        }
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
  request: express.Request,
  response: express.Response
) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response
      .status(400)
      .json({ error: 'Please supply the required credentials' });
  }

  try {
    const userExists = await User.findOne({ email }).select('+password');

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
      user: userExists.role,
    });
  } catch (error: any) {
    console.log('[USER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const logoutUser = async (
  request: express.Request,
  response: express.Response
) => {
  return response
    .status(200)
    .cookie('token', '', { maxAge: 1 })
    .json({ message: 'Logout successful' });
};

export const verifyUser = async (
  request: express.Request,
  response: express.Response
) => {
  const { email, otp } = request.body;

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

        try {
          const info = await sendEmail({
            receipent: email,
            subject: 'Email Verification',
            html: '',
          });
          console.log('Mail sent!', info.messageId);
          return response
            .status(201)
            .json({ message: `OTP has been resent to ${email}` });
        } catch (error: any) {
          console.log('[EMAIL_SENDING_ERROR]', error);
          return response.status(500).json({ error: 'Internal Server Error' });
        }
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

export const loginAdmin = async (
  request: express.Request,
  response: express.Response
) => {
  const { email, password } = request.body;

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

    if (userExists?.role !== 'admin') {
      return response
        .status(403)
        .json({ error: 'Forbidden - Admin access required' });
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

    const adminToken = generateToken(userExists._id);

    return response.status(200).cookie('admin_token', adminToken).json({
      id: userExists._id,
      first_name: userExists.first_name,
      last_name: userExists.last_name,
      email: userExists.email,
      verified: userExists.verified,
      user: userExists.role,
    });
  } catch (error: any) {
    console.log('[USER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
