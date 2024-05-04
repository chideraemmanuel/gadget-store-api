import mongoose from 'mongoose';

const billboardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  head_text: {
    type: String,
    required: true,
    unique: true,
  },
  paragraph: {
    type: String,
    required: false,
  },
  billboard_image: {
    type: String,
    required: true,
  },
});

const Billboard = mongoose.model('Billboard', billboardSchema);

export default Billboard;
