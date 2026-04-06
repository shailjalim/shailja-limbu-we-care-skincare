const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const Product = require('./models/Product');
const { buildRecommendationFields } = require('./utils/productRecommendationFields');

const withRecommendationFields = (product) => ({
  ...product,
  ...buildRecommendationFields(product, { preserveExisting: false }),
});

const products = [
  // Cleansers
  {
    name: "Hydrating Gentle Cleanser",
    category: "Cleanser",
    description: "A gentle, hydrating cleanser perfect for dry skin types. Removes impurities without stripping natural moisture.",
    price: 24.99,
    ingredients: ["Hyaluronic Acid", "Glycerin", "Aloe Vera", "Panthenol", "Water"],
    benefits: ["hydration", "soothing"]
  },
  {
    name: "Oil Control Foaming Cleanser",
    category: "Cleanser",
    description: "Foaming cleanser designed for oily skin to control excess sebum and prevent breakouts.",
    price: 18.99,
    ingredients: ["Salicylic Acid", "Tea Tree Oil", "Witch Hazel", "Glycerin", "Water"],
    benefits: ["oil control", "acne treatment"]
  },
  {
    name: "Balancing Cleanser",
    category: "Cleanser",
    description: "Ideal for combination skin, this cleanser balances oil production and maintains hydration.",
    price: 22.50,
    ingredients: ["Niacinamide", "Green Tea Extract", "Hyaluronic Acid", "Allantoin", "Water"],
    benefits: ["oil control", "hydration", "brightening"]
  },
  {
    name: "Soothing Cleanser",
    category: "Cleanser",
    description: "Gentle cleanser for sensitive skin that calms irritation and restores skin barrier.",
    price: 26.99,
    ingredients: ["Aloe Vera", "Chamomile Extract", "Panthenol", "Bisabolol", "Water"],
    benefits: ["soothing", "hydration"]
  },
  {
    name: "Deep Clean Cleanser",
    category: "Cleanser",
    description: "Powerful cleanser that deeply cleans pores and fights acne-causing bacteria.",
    price: 19.99,
    ingredients: ["Salicylic Acid", "Tea Tree Oil", "Zinc PCA", "Allantoin", "Water"],
    benefits: ["acne treatment", "oil control"]
  },
  {
    name: "Exfoliating Cleanser",
    category: "Cleanser",
    description: "Daily exfoliating cleanser with gentle acids to smooth and brighten skin.",
    price: 21.99,
    ingredients: ["Glycolic Acid", "Lactic Acid", "Hyaluronic Acid", "Aloe Vera", "Water"],
    benefits: ["brightening", "hydration", "oil control"]
  },
  // Toners
  {
    name: "Hydrating Toner",
    category: "Toner",
    description: "Refreshing toner that deeply hydrates and prepares skin for better absorption of moisturizers.",
    price: 16.99,
    ingredients: ["Hyaluronic Acid", "Glycerin", "Panthenol", "Aloe Vera", "Water"],
    benefits: ["hydration", "soothing"]
  },
  {
    name: "Pore Minimizing Toner",
    category: "Toner",
    description: "Toner that minimizes pores and controls oil for a smoother complexion.",
    price: 17.50,
    ingredients: ["Witch Hazel", "Niacinamide", "Green Tea Extract", "Allantoin", "Water"],
    benefits: ["oil control", "brightening"]
  },
  {
    name: "Brightening Toner",
    category: "Toner",
    description: "Vitamin C-infused toner that brightens and evens skin tone.",
    price: 19.99,
    ingredients: ["Vitamin C", "Ferulic Acid", "Hyaluronic Acid", "Licorice Extract", "Water"],
    benefits: ["brightening", "hydration"]
  },
  {
    name: "Calming Toner",
    category: "Toner",
    description: "Calming toner for sensitive skin that reduces redness and irritation.",
    price: 18.99,
    ingredients: ["Chamomile Extract", "Aloe Vera", "Bisabolol", "Panthenol", "Water"],
    benefits: ["soothing", "hydration"]
  },
  {
    name: "Oil Control Toner",
    category: "Toner",
    description: "Mattifying toner that controls excess oil and refines pores.",
    price: 15.99,
    ingredients: ["Niacinamide", "Witch Hazel", "Tea Tree Oil", "Zinc PCA", "Water"],
    benefits: ["oil control", "acne treatment"]
  },
  {
    name: "Refreshing Toner",
    category: "Toner",
    description: "Light, refreshing toner with rose water to balance and hydrate all skin types.",
    price: 14.99,
    ingredients: ["Rose Water", "Hyaluronic Acid", "Glycerin", "Aloe Vera", "Water"],
    benefits: ["hydration", "soothing"]
  },
  // Serums
  {
    name: "Vitamin C Brightening Serum",
    category: "Serum",
    description: "Powerful serum that brightens skin, fades dark spots, and boosts collagen production.",
    price: 45.99,
    ingredients: ["Vitamin C", "Ferulic Acid", "Vitamin E", "Hyaluronic Acid", "Water"],
    benefits: ["brightening", "hydration"]
  },
  {
    name: "Hyaluronic Acid Hydrating Serum",
    category: "Serum",
    description: "Intensely hydrating serum that plumps and smooths dry, dehydrated skin.",
    price: 38.99,
    ingredients: ["Hyaluronic Acid", "Glycerin", "Panthenol", "Aloe Vera", "Water"],
    benefits: ["hydration", "soothing"]
  },
  {
    name: "Niacinamide Oil Control Serum",
    category: "Serum",
    description: "Serum that regulates oil production, minimizes pores, and improves skin texture.",
    price: 32.99,
    ingredients: ["Niacinamide", "Zinc PCA", "Allantoin", "Hyaluronic Acid", "Water"],
    benefits: ["oil control", "brightening"]
  },
  {
    name: "Retinol Anti-Aging Serum",
    category: "Serum",
    description: "Advanced serum with retinol to reduce fine lines, wrinkles, and improve firmness.",
    price: 52.99,
    ingredients: ["Retinol", "Peptides", "Hyaluronic Acid", "Vitamin E", "Water"],
    benefits: ["brightening", "hydration"]
  },
  {
    name: "Aloe Vera Soothing Serum",
    category: "Serum",
    description: "Calming serum that soothes irritated skin and promotes healing.",
    price: 28.99,
    ingredients: ["Aloe Vera", "Bisabolol", "Panthenol", "Chamomile Extract", "Water"],
    benefits: ["soothing", "hydration"]
  },
  {
    name: "Salicylic Acid Acne Treatment Serum",
    category: "Serum",
    description: "Targeted serum that treats acne, unclogs pores, and prevents breakouts.",
    price: 29.99,
    ingredients: ["Salicylic Acid", "Tea Tree Oil", "Witch Hazel", "Allantoin", "Water"],
    benefits: ["acne treatment", "oil control"]
  },
  {
    name: "Peptide Firming Serum",
    category: "Serum",
    description: "Firming serum with peptides to strengthen skin and reduce signs of aging.",
    price: 48.99,
    ingredients: ["Peptides", "Hyaluronic Acid", "Vitamin C", "Ferulic Acid", "Water"],
    benefits: ["brightening", "hydration"]
  },
  // Moisturizers
  {
    name: "Hydrating Day Cream",
    category: "Moisturizer",
    description: "Lightweight day cream that provides all-day hydration for dry skin.",
    price: 34.99,
    ingredients: ["Hyaluronic Acid", "Shea Butter", "Vitamin E", "Glycerin", "Water"],
    benefits: ["hydration", "soothing"]
  },
  {
    name: "Oil Control Gel",
    category: "Moisturizer",
    description: "Gel moisturizer that controls oil and keeps skin matte throughout the day.",
    price: 27.99,
    ingredients: ["Niacinamide", "Hyaluronic Acid", "Aloe Vera", "Tea Tree Oil", "Water"],
    benefits: ["oil control", "hydration"]
  },
  {
    name: "Balancing Lotion",
    category: "Moisturizer",
    description: "Balanced lotion for combination skin that hydrates without greasiness.",
    price: 31.99,
    ingredients: ["Hyaluronic Acid", "Niacinamide", "Green Tea Extract", "Glycerin", "Water"],
    benefits: ["hydration", "oil control"]
  },
  {
    name: "Barrier Repair Cream",
    category: "Moisturizer",
    description: "Rich cream that repairs and strengthens the skin barrier for sensitive skin.",
    price: 39.99,
    ingredients: ["Ceramides", "Cholesterol", "Fatty Acids", "Panthenol", "Water"],
    benefits: ["soothing", "hydration"]
  },
  {
    name: "Rich Night Cream",
    category: "Moisturizer",
    description: "Nourishing night cream that deeply hydrates and repairs skin overnight.",
    price: 42.99,
    ingredients: ["Shea Butter", "Hyaluronic Acid", "Vitamin E", "Peptides", "Water"],
    benefits: ["hydration", "soothing"]
  },
  {
    name: "Lightweight Lotion",
    category: "Moisturizer",
    description: "Fast-absorbing lotion for oily skin that provides hydration without weight.",
    price: 25.99,
    ingredients: ["Hyaluronic Acid", "Glycerin", "Aloe Vera", "Niacinamide", "Water"],
    benefits: ["hydration", "oil control"]
  },
  {
    name: "Nourishing Balm",
    category: "Moisturizer",
    description: "Intensive balm for very dry skin that locks in moisture and nourishes deeply.",
    price: 36.99,
    ingredients: ["Shea Butter", "Coconut Oil", "Beeswax", "Vitamin E", "Water"],
    benefits: ["hydration", "soothing"]
  },
  // Sunscreens
  {
    name: "Broad Spectrum SPF 30",
    category: "Sunscreen",
    description: "Daily sunscreen that protects against UVA and UVB rays with SPF 30.",
    price: 19.99,
    ingredients: ["Zinc Oxide", "Titanium Dioxide", "Hyaluronic Acid", "Vitamin E", "Water"],
    benefits: ["sun protection", "hydration"]
  },
  {
    name: "Mineral Sunscreen",
    category: "Sunscreen",
    description: "Gentle mineral sunscreen ideal for sensitive skin with physical blockers.",
    price: 22.99,
    ingredients: ["Zinc Oxide", "Titanium Dioxide", "Aloe Vera", "Panthenol", "Water"],
    benefits: ["sun protection", "soothing"]
  },
  {
    name: "Oil-Free Sunscreen",
    category: "Sunscreen",
    description: "Mattifying sunscreen that provides protection without adding oil to the skin.",
    price: 20.99,
    ingredients: ["Avobenzone", "Octinoxate", "Niacinamide", "Hyaluronic Acid", "Water"],
    benefits: ["sun protection", "oil control"]
  },
  {
    name: "Hydrating Sunscreen",
    category: "Sunscreen",
    description: "Moisturizing sunscreen that protects while hydrating dry skin.",
    price: 24.99,
    ingredients: ["Zinc Oxide", "Hyaluronic Acid", "Glycerin", "Vitamin E", "Water"],
    benefits: ["sun protection", "hydration"]
  },
  {
    name: "Tinted Sunscreen",
    category: "Sunscreen",
    description: "Tinted sunscreen that provides natural coverage and sun protection.",
    price: 23.99,
    ingredients: ["Zinc Oxide", "Iron Oxides", "Hyaluronic Acid", "Aloe Vera", "Water"],
    benefits: ["sun protection", "brightening"]
  },
  {
    name: "Sport Sunscreen",
    category: "Sunscreen",
    description: "Water-resistant sunscreen designed for active lifestyles and outdoor activities.",
    price: 21.99,
    ingredients: ["Avobenzone", "Homosalate", "Octisalate", "Niacinamide", "Water"],
    benefits: ["sun protection", "oil control"]
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    const enrichedProducts = products.map(withRecommendationFields);
    await Product.deleteMany();
    await Product.insertMany(enrichedProducts);
    console.log('Database seeded successfully with 32 products!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedProducts();