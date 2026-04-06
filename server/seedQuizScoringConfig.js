require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const QuizScoringConfig = require('./models/QuizScoringConfig');

const DEFAULT_CONFIG = {
  name: 'default',
  version: 1,
  isActive: true,
  optionWeightOverrides: [],
  notes: 'Default scoring config. Add optionWeightOverrides to tune quiz scoring without code edits.',
};

const seedQuizScoringConfig = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      throw new Error('Database connection failed.');
    }

    const existing = await QuizScoringConfig.findOne({ name: 'default' });
    if (existing) {
      console.log('Quiz scoring config already exists. No changes made.');
      return;
    }

    await QuizScoringConfig.create(DEFAULT_CONFIG);
    console.log('Quiz scoring config seeded successfully.');
  } catch (error) {
    console.error('Error seeding quiz scoring config:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedQuizScoringConfig();
