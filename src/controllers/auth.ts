import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import User from '../models/user';
import { compareHash, hashData } from '../lib/helpers/hash';
import generateOtp from '../lib/helpers/generateOtp';
import Otp from '../models/otp';
import { generateToken, verifyToken } from '../lib/helpers/token';
import sendEmail from '../lib/helpers/sendEmail';
import mongoose from 'mongoose';
import PasswordReset from '../models/passwordReset';

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

  // const passwordRegex =
  //   /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*\W)(?!.* ).{8,16}$/;

  const passwordValid = passwordRegex.test(password);

  if (!passwordValid) {
    return response.status(400).json({
      error:
        'Password must be 8-16 characters long, and contain at least one numeric digit, and a special character',
    });
  }

  try {
    const session = await mongoose.startSession();

    try {
      const transactionResult = await session.withTransaction(async () => {
        const userExists = await User.findOne({ email });

        if (userExists) {
          return response
            .status(400)
            .json({ error: 'Email is already in use' });
        }

        const hashedPassword = await hashData(password);
        const createdUser = await User.create(
          [
            {
              first_name,
              last_name,
              email,
              password: hashedPassword,
              auth_type: 'MANUAL_AUTH_SERVICE',
            },
          ],
          { session }
        );

        const token = generateToken(createdUser[0]._id);
        const otp = generateOtp();
        const hashedOtp = await hashData(otp);

        await Otp.create(
          [
            {
              email,
              otp: hashedOtp,
              createdAt: Date.now(),
              expiresAt: Date.now() + 3600000,
            },
          ],
          { session }
        );

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
              id: createdUser[0]._id,
              first_name: createdUser[0].first_name,
              last_name: createdUser[0].last_name,
              email: createdUser[0].email,
              verified: createdUser[0].verified,
              auth_type: createdUser[0].auth_type,
              role: createdUser[0].role,
            },
            message: `OTP has been sent to ${email}`,
          });
      });

      return transactionResult;
    } catch (error: any) {
      console.log('[TRANSACTION_ERROR]', error);
      // await session.abortTransaction();
      return response.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await session.endSession();
    }
  } catch (error: any) {
    console.log('[SESSION_START_ERROR]', error);
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

    if (userExists?.auth_type === 'GOOGLE_AUTH_SERVICE') {
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
    const session = await mongoose.startSession();

    try {
      const transactionResult = await session.withTransaction(async () => {
        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord) {
          return response.status(404).json({ error: 'No OTP record found' });
        }

        // TODO: probably check OTP expiry

        const otpMatches = await compareHash(otp, otpRecord.otp);

        if (!otpMatches) {
          return response.status(400).json({ error: 'Invalid OTP' });
        }

        await User.findOneAndUpdate({ email }, { verified: true }, { session });

        await Otp.findByIdAndDelete(otpRecord._id, { session });

        return response.status(200).json({
          message: `Email (${email}) has been verified successfully`,
        });
      });

      return transactionResult;
    } catch (error: any) {
      console.log('[TRANSACTION_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await session.endSession();
    }
  } catch (error: any) {
    console.log('[SESSION_START_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const resendOtp = async (
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
    const session = await mongoose.startSession();

    try {
      const transactionResult = await session.withTransaction(async () => {
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

        const otpRecord = await Otp.findOne({ email });

        if (otpRecord) {
          await Otp.deleteOne({ email }, { session });
        }

        const otp = generateOtp();
        const hashedOtp = hashData(otp);

        await Otp.create(
          [
            {
              email,
              otp: hashedOtp,
              createdAt: Date.now(),
              expiresAt: Date.now() + 3600000,
            },
          ],
          { session }
        );

        const info = await sendEmail({
          receipent: email,
          subject: 'Email Verification',
          html: '',
        });

        console.log('Mail sent!', info.messageId);

        return response
          .status(201)
          .json({ message: `OTP has been resent to ${email}` });
      });

      return transactionResult;
    } catch (error: any) {
      console.log('[TRANSACTION_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await session.endSession();
    }
  } catch (error: any) {
    console.log('[SESSION_START_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const initiatePasswordReset = async (
  request: express.Request,
  response: express.Response
) => {
  const { email, redirect_url } = request.body;

  if (!email || !redirect_url) {
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

    if (userExists && !userExists.verified) {
      return response.status(401).json({ error: `Email hasn't been verified` });
    }

    if (userExists && userExists.auth_type === 'GOOGLE_AUTH_SERVICE') {
      return response.status(400).json({
        error: 'Account was verified with Google. Sign in with Google instead.',
      });
    }

    const reset_string = uuid();

    try {
      const session = await mongoose.startSession();

      try {
        const transactionResult = await session.withTransaction(async () => {
          const hashedResetString = await hashData(reset_string);

          const passwordResetRecord = await PasswordReset.findOne({ email });

          if (passwordResetRecord) {
            await PasswordReset.deleteOne({ email }, { session });
          }

          const NewPasswordResetRecord = await PasswordReset.create(
            [
              {
                email,
                reset_string: hashedResetString,
                createdAt: Date.now(),
                expiresAt: Date.now() + 3600000,
              },
            ],
            { session }
          );

          const info = await sendEmail({
            receipent: email,
            subject: 'Password Reset',
            html: `<p>We heard you forgot your password. Please click <a href=${`${redirect_url}?email=${encodeURIComponent(
              email
            )}&reset_string=${reset_string}`}>here</a> to reset.</p>`,
          });

          // console.log('Mail sent!', info.messageId);

          return response.status(201).json({
            status: 'PENDING',
            message: `Password reset link has been sent to ${email}`,
          });
        });

        return transactionResult;
      } catch (error: any) {
        console.log('[TRANSACTION_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (error: any) {
      console.log('[SESSION_START_ERROR]', error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error: any) {
    console.log('[USER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const resetPassword = async (
  request: express.Request,
  response: express.Response
) => {
  const { email, reset_string, new_password } = request.body;

  if (!email || reset_string || new_password) {
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

    if (userExists && !userExists.verified) {
      return response.status(401).json({ error: `Email hasn't been verified` });
    }

    if (userExists && userExists.auth_type === 'GOOGLE_AUTH_SERVICE') {
      return response.status(400).json({
        error: 'Account was verified with Google. Sign in with Google instead.',
      });
    }

    try {
      const passwordResetRecord = await PasswordReset.findOne({ email });

      if (!passwordResetRecord) {
        return response
          .status(404)
          .json({ error: 'No password reset request found' });
      }

      const {
        email: storedEmail,
        reset_string: storedResetString,
        createdAt,
        expiresAt,
      } = passwordResetRecord;

      // TODO: probably check rsest string expiry

      const resetStringValid = await compareHash(
        reset_string,
        storedResetString
      );

      if (!resetStringValid) {
        return response.status(400).json({ error: 'Invalid reset string' });
      }

      try {
        const session = await mongoose.startSession();

        try {
          const transactionResult = await session.withTransaction(async () => {
            const hashedNewPassword = await hashData(new_password);

            await User.updateOne(
              { email },
              { password: hashedNewPassword },
              { session }
            );

            await PasswordReset.deleteOne({ email }, { session });

            return response.status(200).json({
              status: 'SUCCESS',
              message: 'Password reset successfully',
            });
          });

          return transactionResult;
        } catch (error: any) {
          console.log('[TRANSACTION_ERROR]', error);
          return response.status(500).json({ error: 'Internal Server Error' });
        }
      } catch (error: any) {
        console.log('[SESSION_START_ERROR]', error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (error: any) {
      console.log('[RESET_RECORD_FETCH_ERROR]', error);
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
    const userExists = await User.findOne({ email }).select('+password');

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

    if (userExists?.auth_type === 'GOOGLE_AUTH_SERVICE') {
      return response.status(400).json({
        error:
          'Account already verified with Google. Sign in with Google instead.',
      });
    }

    console.log('password', password);
    console.log('stored password', userExists.password);

    const passwordMatches = await compareHash(
      password,
      userExists.password as string
    );

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
      role: userExists.role,
    });
  } catch (error: any) {
    console.log('[USER_FETCH_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const logoutAdmin = (
  request: express.Request,
  response: express.Response
) => {
  return response
    .status(200)
    .cookie('admin_token', '', { maxAge: 1 })
    .json({ message: 'Logout Successful' });
};

export const getCurrentAdmin = async (
  request: express.Request,
  response: express.Response
) => {
  const { admin_token } = request.cookies;
  // const admin_token2 = request.cookies.admin_token;
  console.log('admin token:', admin_token);
  // console.log(admin_token2);

  if (!admin_token) {
    return response.status(401).json({ error: 'Unauthorized - No token' });
  }

  const decoded = await verifyToken(admin_token);

  if (!decoded) {
    return response
      .status(401)
      .json({ error: 'Not authorized' })
      .cookie('admin_token', '', { maxAge: 1 });
  }

  try {
    const user = await User.findById(decoded?.data);

    if (!user) {
      return response
        .status(404)
        .json({ error: 'User not found' })
        .cookie('admin_token', '', { maxAge: 1 });
    }

    if (user?.role !== 'admin') {
      return response
        .status(403)
        .json({ error: 'Forbidden - Not authorized' })
        .cookie('admin_token', '', { maxAge: 1 });
    }

    return response.status(200).json(user);
  } catch (error: any) {
    console.log('[AUTHENTICATION_ERROR]', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};
