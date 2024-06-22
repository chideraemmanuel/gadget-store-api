import mongoose, { model } from 'mongoose';

const PasswordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  reset_string: {
    type: String,
    required: true,
  },
  createdAt: Date,
  expiresAt: Date,
});

const PasswordReset = model('PasswordReset', PasswordResetSchema);

export default PasswordReset;
