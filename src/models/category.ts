import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  billboard: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Billboard',
    autopopulate: true,
  },
});

categorySchema.plugin(mongooseAutoPopulate);

const Category = mongoose.model('Category', categorySchema);

export default Category;
