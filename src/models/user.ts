import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    select: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  auth_type: {
    // type: 'MANUAL_AUTH_SERVICE' || 'GOOGLE_AUTH_SERVICE',
    type: String,
    required: true,
    enum: ['MANUAL_AUTH_SERVICE', 'GOOGLE_AUTH_SERVICE'],
  },
  role: {
    type: String,
    default: 'user',
  },
});

const User = mongoose.model('User', userSchema);

export default User;
