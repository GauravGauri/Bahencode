const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/behencode';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,
      tls: uri.startsWith('mongodb+srv://'),
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\n====================================================================');
    console.error('❌ DATABASE CONNECTION ERROR');
    console.error('====================================================================');
    console.error(error.stack || error);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\n💡 MongoDB Atlas Connection Troubleshooting:');
      console.error('1. IP Whitelisting Issue (Most Common):');
      console.error('   - Go to MongoDB Atlas Console (https://cloud.mongodb.com)');
      console.error('   - Select your project, and go to "Security" -> "Network Access".');
      console.error('   - Click "Add IP Address".');
      console.error('   - Select "Add Current IP Address" or enter "0.0.0.0/0" (allows access from anywhere, useful for dynamic IPs/dev).');
      console.error('2. Network or Firewall Block:');
      console.error('   - Verify that your local network/firewall or VPN allows outgoing connections on port 27017.');
      console.error('3. Check MONGO_URI:');
      console.error('   - Double-check the MONGO_URI value in your backend/.env file.');
    }
    console.error('====================================================================\n');
    process.exit(1);
  }
};

module.exports = connectDB;
