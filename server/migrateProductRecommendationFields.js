require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const Product = require('./models/Product');
const { buildRecommendationFields } = require('./utils/productRecommendationFields');

const sortAndJoin = (values = []) => values.slice().sort().join('|');

const arraysAreEqualIgnoringOrder = (a = [], b = []) => {
  return sortAndJoin(a) === sortAndJoin(b);
};

const migrateProductRecommendationFields = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      throw new Error('Database connection failed. Migration aborted.');
    }

    const products = await Product.find({});
    if (products.length === 0) {
      console.log('No products found. Nothing to migrate.');
      return;
    }

    const operations = [];

    products.forEach((product) => {
      const currentSkinTypes = Array.isArray(product.skinTypes) ? product.skinTypes : [];
      const currentConcerns = Array.isArray(product.concerns) ? product.concerns : [];

      const { skinTypes, concerns } = buildRecommendationFields(product.toObject(), {
        preserveExisting: true,
      });

      const needsSkinTypeUpdate = !arraysAreEqualIgnoringOrder(currentSkinTypes, skinTypes);
      const needsConcernUpdate = !arraysAreEqualIgnoringOrder(currentConcerns, concerns);

      if (needsSkinTypeUpdate || needsConcernUpdate) {
        operations.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                skinTypes,
                concerns,
              },
            },
          },
        });
      }
    });

    if (operations.length === 0) {
      console.log('Products already contain valid recommendation fields. No updates needed.');
      return;
    }

    const result = await Product.bulkWrite(operations);
    console.log(`Migration complete. Updated ${result.modifiedCount} product(s).`);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

migrateProductRecommendationFields();
