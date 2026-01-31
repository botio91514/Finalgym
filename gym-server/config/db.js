const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB Connection Error:', err);

    // Check for common errors
    if (err.name === 'MongoNetworkError' || err.message.includes('ECONNREFUSED')) {
      console.log('\n\x1b[33m%s\x1b[0m', '--- CONNECTION ISSUE DETECTED ---');
      console.log('It looks like your IP address might not be whitelisted in MongoDB Atlas.');
      console.log('Please follow these steps:');
      console.log('1. Go to your MongoDB Atlas Dashboard.');
      console.log('2. Navigate to "Network Access" in the sidebar.');
      console.log('3. Click "Add IP Address".');
      console.log('4. Select "Add Current IP Address" and confirm.');
      console.log('---------------------------------\n');
    }

    console.error('MongoDB Connection Error:', err.message);
    // Do not exit the process, allow the server to start (requests will fail but app stays up)
    // process.exit(1);
  }
};

module.exports = connectDB;