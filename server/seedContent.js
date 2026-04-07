const { connectDB } = require('./config/db');
const Content = require('./models/Content');
const contentSeed = require('./data/contentSeed.json');

const seedContent = async () => {
  try {
    await connectDB();
    await Content.deleteMany({});
    await Content.insertMany(contentSeed);
    console.log(`Seeded ${contentSeed.length} content articles`);
    process.exit(0);
  } catch (error) {
    console.error('Content seed failed:', error);
    process.exit(1);
  }
};

seedContent();