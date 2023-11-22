const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define your Mongoose schemas
const collection1Schema = new Schema({ /* schema definition for collection1 */ });
const collection2Schema = new Schema({ /* schema definition for collection2 */ });

// Create Mongoose models
const Collection1 = mongoose.model('Collection1', collection1Schema);
const Collection2 = mongoose.model('Collection2', collection2Schema);

async function createRecords(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create the first record
    const result1 = await Collection1.create([{ /* data for collection1 */ }], { session });

    // Simulate a failure in the second record creation
    if (/* some condition */) {
      throw new Error('Failed to create the second record');
    }

    // Create the second record
    const result2 = await Collection2.create([{ /* data for collection2 */ }], { session });

    // Commit the transaction if both records are created successfully
    await session.commitTransaction();

    res.status(200).json({ result1, result2 });
  } catch (error) {
    // Something went wrong, abort the transaction
    await session.abortTransaction();
    console.error('Error creating records:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // End the session
    session.endSession();
  }
}

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost:27017/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use the createRecords function in your route handler

// 
// 
// 
// 
// ***********************************************
// ***********************************************
// ***********************************************
// ***********************************************

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

const createUser = async (username, email) => {
  const session = await mongoose.startSession();

  try {
    const user = new User({ name: username, email: email });
    await user.save({ session: session });

    const post = new Post({ title: 'Welcome Post', content: 'This is your first post.', author: user._id });
    await post.save({ session: session });

    await session.commitTransaction();
    console.log('Both records created successfully');
  } catch (err) {
    await session.abortTransaction();
    console.error('Error creating records:', err);
  } finally {
    await session.endSession();
  }
};

createUser('John Doe', 'johndoe@example.com');
