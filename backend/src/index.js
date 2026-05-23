require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedData = require('./config/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    // Seed admin and default products
    await seedData();

    // Start Server
    app.listen(PORT, () => {
      console.log(`Express server running on port ${PORT}`);
      console.log(`Press Ctrl+C to terminate server`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
