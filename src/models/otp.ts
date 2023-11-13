import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    // default: Date.now()
  },
  expiresAt: Date,
});

const Otp = mongoose.model('Otp', OtpSchema);

export default Otp;
