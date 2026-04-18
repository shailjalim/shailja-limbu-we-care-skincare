require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const Product = require('./models/Product');

const migrateRemoveProductPrices = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      throw new Error('Database connection failed. Migration aborted.');
    }

    const result = await Product.updateMany(
      { price: { $exists: true } },
      { $unset: { price: '' } }
    );

    console.log(`Migration complete. Matched ${result.matchedCount} product(s), updated ${result.modifiedCount} product(s).`);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

migrateRemoveProductPrices();
