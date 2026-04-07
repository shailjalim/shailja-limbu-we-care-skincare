# Recommendation Engine - Visual Architecture & Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                           │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ HTTP Request
               │ GET /api/products/recommendations/personalized
               │ Headers: Authorization: Bearer {token}
               │
    ┌──────────▼──────────┐
    │  API Service Layer  │
    │ getRecommendedProducts()│
    │ getDetailedRecommendations()
    └──────────┬──────────┘
               │
               │ axios request w/ JWT
               │
┌──────────────▼──────────────────────────────────────────────┐
│               EXPRESS BACKEND (Node.js)                     │
│                                                              │
│  Route: /products/recommendations/personalized             │
│  Middleware: protect (validates JWT)                       │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  productController.getRecommendedProducts()         │   │
│  │                                                      │   │
│  │  1. Extract userId from req.user (from JWT)        │   │
│  │  2. Fetch SkinProfile                              │   │
│  │     ├─ skinType, concerns, allergies, etc         │   │
│  │     └─ Returns 404 if not found                   │   │
│  │  3. Fetch all Products from database               │   │
│  │  4. Call recommendation utility function           │   │
│  │  5. Return ranked results + user profile           │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  productRecommendation.js (Utility Module)         │   │
│  │                                                      │   │
│  │  getRecommendedProducts(userProfile, products)    │   │
│  │                                                      │   │
│  │  Step 1: Filter by skinType                        │   │
│  │  ────────────────────────────────────              │   │
│  │  Keep only products where:                         │   │
│  │    product.skinTypes.includes(userProfile.skinType)│  │
│  │                                                      │   │
│  │  Step 2: Match concerns                            │   │
│  │  ────────────────────────                          │   │
│  │  Keep only products with ≥1 matching concern:     │   │
│  │    product.concerns ∩ userProfile.concerns        │   │
│  │                                                      │   │
│  │  Step 3: Filter allergies (CRITICAL!)             │   │
│  │  ──────────────────────────────────                │   │
│  │  REMOVE if ANY ingredient is an allergy:          │   │
│  │    product.ingredients ∩ userProfile.allergies    │   │
│  │                                                      │   │
│  │  Step 4: Calculate scores                          │   │
│  │  ──────────────────────                            │   │
│  │  For each remaining product:                       │   │
│  │    score = 0                                       │   │
│  │    if skinType matches: score += 2                │   │
│  │    for each concern match: score += 2             │   │
│  │    if has benefits: score += 1                    │   │
│  │                                                      │   │
│  │  Step 5: Sort & Return                             │   │
│  │  ──────────────────────                            │   │
│  │  Sort by score DESC, return top N (default 5)    │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
                   ┌─────────────────┐
                   │  MongoDB        │
                   │  ├─ Products    │
                   │  ├─ Profiles    │
                   │  └─ (indexed)   │
                   └─────────────────┘
```

---

## Data Flow Diagram

```
USER ACTION: User visits Dashboard
│
├─→ Frontend calls: getRecommendedProducts({ limit: 5 })
│
├─→ API Request
│   GET /api/products/recommendations/personalized
│   Authorization: Bearer {jwt}
│   ?limit=5&groupByCategory=false&detailed=false
│
├─→ Backend Processing
│   │
│   ├─ Validate JWT token ✓
│   ├─ Get userId from token
│   ├─ Query: SkinProfile.findOne({ user: userId })
│   │  └─ Returns: { skinType: "oily", concerns: ["acne", ...], allergies: ["fragrance"], ... }
│   ├─ Query: Product.find()
│   │  └─ Returns: 500 products from database
│   ├─ Call getRecommendedProducts(profile, products)
│   │  ├─ Stage 1: Filter skinType → 150 products
│   │  ├─ Stage 2: Filter concerns → 80 products
│   │  ├─ Stage 3: Remove allergens → 75 products
│   │  ├─ Stage 4: Score each → [5, 5, 4, 4, 3, ...]
│   │  └─ Stage 5: Return top 5 → [prod1, prod2, prod3, prod4, prod5]
│   │
│   └─ Return JSON Response
│      {
│        "success": true,
│        "count": 5,
│        "userProfile": { ... },
│        "recommendations": [ ... ]
│      }
│
├─→ Frontend Processing
│   ├─ Parse response
│   ├─ Render ProductGrid with recommendations
│   └─ Display recommendations to user
│
└─→ USER SEES: 5 personalized product recommendations
```

---

## Scoring Algorithm Visualization

```
┌─────────────────────────────────────────────────────────────┐
│         EXAMPLE: SCORING A SERUM FOR USER "JANE"            │
└─────────────────────────────────────────────────────────────┘

USER PROFILE (Jane):
  skinType: "dry"
  concerns: ["dryness", "aging"]
  allergies: ["fragrance", "alcohol"]
  sensitivityLevel: "medium"

PRODUCT: "Hyaluronic Serum"
  skinTypes: ["dry", "sensitive"]
  concerns: ["dryness", "aging"]
  ingredients: ["hyaluronic acid", "vitamin C", "water"]  (NO allergens ✓)
  benefits: ["hydration", "anti-aging"]

SCORING PROCESS:
│
├─ Stage 1: Check Allergens
│  ├─ Contains "fragrance"?  NO  ✓
│  ├─ Contains "alcohol"?    NO  ✓
│  └─ RESULT: Keep in pool ✓
│
├─ Stage 2: Check skinType
│  ├─ Jane's skinType: "dry"
│  ├─ Product skinTypes: ["dry", "sensitive"]
│  ├─ Match? YES - "dry" included
│  └─ SCORE += 2  (Total: 2)
│
├─ Stage 3: Check Concerns
│  ├─ Jane's concerns: ["dryness", "aging"]
│  ├─ Product concerns: ["dryness", "aging"]
│  ├─ Matches: 2 (both concerns match!)
│  └─ SCORE += 2 × 2 = 4  (Total: 6)
│
├─ Stage 4: Check Benefits
│  ├─ Product benefits: ["hydration", "anti-aging"] (exists)
│  └─ SCORE += 1  (Total: 7, capped at 6)
│
└─ FINAL SCORE: 6/6 ⭐⭐⭐⭐⭐⭐ (PERFECT MATCH!)

COMPARISON WITH OTHER PRODUCTS:
  1. Hyaluronic Serum       → Score 6 ⭐⭐⭐⭐⭐⭐ (dry + both concerns + benefits)
  2. Vitamin C Serum        → Score 5 ⭐⭐⭐⭐⭐   (dry + 1 concern + benefits)
  3. Glycerin Serum         → Score 4 ⭐⭐⭐⭐     (dry + 1 concern)
  4. Retinol Serum          → Score 4 ⭐⭐⭐⭐     (dry + 1 concern)
  5. Niacinamide Serum      → Score 3 ⭐⭐⭐       (dry + benefits)
  X. Fragrance Oil          → FILTERED OUT ✓ (contains fragrance allergy)
  X. Alcohol-Based Toner    → FILTERED OUT ✓ (contains alcohol allergy)
```

---

## Frontend Component Integration Map

```
┌─────────────────────────────────────────────────────────────┐
│                    APP ROUTING TREE                         │
└─────────────────────────────────────────────────────────────┘

/dashboard
├─ Dashboard.jsx
│  │
│  ├─ RecommendedProducts Component
│  │  │
│  │  └─ Calls: getRecommendedProducts({ limit: 5 })
│  │     └─ Displays: Top 5 products in grid
│  │        ├─ Product cards with match scores
│  │        ├─ "View Details" button → /product/:id
│  │        └─ "Use in Routine" button → /routines?productId=...
│  │
│  └─ UserProfileCard
│     └─ Shows: skinType, concerns, allergies
│
/routines (Routine Builder)
├─ RoutineTracker.jsx
│  │
│  ├─ Calls: getRecommendedProducts({ groupByCategory: true, limit: 6 })
│  │  └─ Returns: Top product per category
│  │
│  ├─ Morning Routine Section
│  │  ├─ Cleanser Step
│  │  │  └─ Shows: Recommended cleanser first in dropdown
│  │  ├─ Toner Step
│  │  │  └─ Shows: Recommended toner first in dropdown
│  │  ├─ Serum Step
│  │  ├─ Moisturizer Step
│  │  └─ Sunscreen Step
│  │
│  └─ Night Routine Section
│     ├─ Cleanser Step
│     ├─ Toner Step
│     ├─ Serum Step
│     └─ Moisturizer Step (NO SUNSCREEN HERE)
│
/product/:id
├─ ProductDetail.jsx
│  │
│  └─ Calls: getDetailedRecommendations({ limit: 10 })
│     └─ If product in results:
│        ├─ Shows match percentage badge
│        ├─ Displays recommendation reason
│        └─ Highlights why recommended
│
/recommendations (NEW - Optional Dedicated Page)
├─ RecommendationsPage.jsx
│  │
│  └─ Advanced recommendation features:
│     ├─ Sort by match %
│     ├─ Filter by category
│     ├─ Compare products
│     └─ Add to cart directly
```

---

## API Response Examples

### **Example 1: Basic Request Response**

```
REQUEST:
GET /api/products/recommendations/personalized?limit=5
Authorization: Bearer eyJhbGc...

RESPONSE (200 OK):
{
  "success": true,
  "count": 5,
  "userProfile": {
    "skinType": "combination",
    "concerns": ["acne", "oil control", "dryness"],
    "allergies": ["salicylic acid"],
    "sensitivityLevel": "medium"
  },
  "recommendations": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Balancing Toner",
      "price": 24.99,
      "category": "Toner",
      "skinTypes": ["combination", "oily"],
      "concerns": ["oil control", "balance"],
      "recommendationScore": 4,
      "benefits": ["pH balancing", "hydration"],
      "description": "Lightweight toner for balanced skin",
      "ingredients": ["witch hazel", "glycerin", "water"]
    },
    // ... 4 more products
  ]
}
```

### **Example 2: Detailed Request Response**

```
REQUEST:
GET /api/products/recommendations/personalized?limit=3&detailed=true
Authorization: Bearer eyJhbGc...

RESPONSE (200 OK):
{
  "success": true,
  "count": 3,
  "userProfile": {
    "skinType": "dry",
    "concerns": ["dryness", "sensitivity"],
    "allergies": [],
    "sensitivityLevel": "high"
  },
  "recommendations": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Rich Moisture Serum",
      "price": 38.99,
      "category": "Serum",
      "skinTypes": ["dry", "sensitive"],
      "concerns": ["dryness", "sensitivity"],
      "recommendationScore": 6,
      "recommendation": {
        "reason": "Designed for dry skin. Addresses your concerns: dryness, sensitivity",
        "matchPercentage": 100
      },
      "benefits": ["deep hydration", "barrier repair", "soothing"],
      "description": "Intensive moisture serum for sensitive dry skin",
      "ingredients": ["hyaluronic acid", "ceramides", "aloe vera"]
    },
    // ... 2 more products
  ]
}
```

### **Example 3: Error Response - No Profile**

```
REQUEST:
GET /api/products/recommendations/personalized
Authorization: Bearer eyJhbGc...

RESPONSE (404 Not Found):
{
  "error": "User profile not found. Please complete the skin quiz first."
}
```

### **Example 4: Grouped by Category Response**

```
REQUEST:
GET /api/products/recommendations/personalized?groupByCategory=true&limit=6
Authorization: Bearer eyJhbGc...

RESPONSE (200 OK):
[
  {
    "category": "Cleanser",
    "recommendationScore": 5,
    "name": "Gentle Cleanser",
    // ... product data
  },
  {
    "category": "Toner",
    "recommendationScore": 4,
    "name": "Hydrating Toner",
    // ... product data
  },
  {
    "category": "Serum",
    "recommendationScore": 6,
    "name": "Vitamin C Serum",
    // ... product data
  },
  {
    "category": "Moisturizer",
    "recommendationScore": 5,
    "name": "Rich Cream",
    // ... product data
  },
  {
    "category": "Sunscreen",
    "recommendationScore": 3,
    "name": "SPF 50",
    // ... product data
  },
  {
    "category": "Toner",  // Second product from category
    "recommendationScore": 3,
    "name": "Hydrating Essence",
    // ... product data
  }
]
```

---

## State Management & Data Flow in React

```
┌──────────────────────────────────────────────────┐
│  RecommendedProducts Component                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  State:                                         │
│  ├─ recommendations: [] (from API)             │
│  ├─ loading: true (during fetch)               │
│  ├─ error: null (if fetch fails)              │
│  └─ userProfile: { skinType, concerns, ... }  │
│                                                  │
│  Effects:                                       │
│  └─ useEffect(() => {                         │
│       getRecommendedProducts()                │
│       .then(data => setRecommendations())      │
│     }, [])                                     │
│                                                  │
│  Render:                                        │
│  ├─ If loading: Show spinner                  │
│  ├─ If error: Show error message             │
│  └─ Else: Render product grid                 │
│      ├─ Product cards                         │
│      ├─ Score badge                           │
│      └─ Action buttons                        │
│           (View Details, Use in Routine)      │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Performance Considerations

```
┌────────────────────────────────────────────────┐
│           PERFORMANCE TIMELINE                 │
├────────────────────────────────────────────────┤
│                                                │
│ User clicks "Get Recommendations"             │
│ │                                             │
│ ├─ API call (network latency): ~50-100ms    │
│ │  GET /api/products/recommendations...      │
│ │                                             │
│ ├─ Backend processing:                       │
│ │  ├─ JWT validation: ~5ms                  │
│ │  ├─ SkinProfile query: ~20ms              │
│ │  ├─ Product query: ~100ms (500 products)  │
│ │  ├─ Recommendation calculation: ~50ms     │
│ │  └─ JSON serialization: ~5ms              │
│ │                                             │
│ ├─ Response travel: ~50-100ms               │
│ │                                             │
│ ├─ Frontend processing:                      │
│ │  ├─ Parse response: ~1ms                  │
│ │  └─ Re-render component: ~10-50ms         │
│ │                                             │
│ └─ Total: 300-400ms ✓ (Acceptable)          │
│                                               │
│ OPTIMIZATION IDEAS:                          │
│ ├─ Cache recommendations (Redis) 24hrs      │
│ ├─ Reduce Product query with projections    │
│ ├─ Add database indexes                     │
│ └─ Pre-compute recommendations (cron job)   │
│                                               │
└────────────────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌──────────────────┐
│ User Collection  │
├──────────────────┤
│ _id              │ ← Primary Key
│ email            │
│ password         │
│ role             │
│ createdAt        │
└────────┬─────────┘
         │ references
         │
         │ one-to-one
         │
┌────────▼──────────────────┐
│ SkinProfile Collection     │
├─────────────────────────────┤
│ _id                        │
│ user (ref to User)         │ ← Foreign Key
│ skinType (enum)            │
│ concerns (array)           │
│ allergies (array)          │
│ sensitivityLevel (enum)    │
│ lifestyle: {               │
│   sunExposure,            │
│   waterIntake             │
│ }                          │
│ routineStats: { ... }      │
│ lastQuizDate (Date)        │
│ createdAt, updatedAt       │
└────────┬────────────────────┘
         │
         │ uses for filtering
         │
┌────────▼──────────────────┐
│ Product Collection         │
├─────────────────────────────┤
│ _id                        │
│ name                       │
│ price                      │
│ category (enum)            │
│ skinTypes (array)          │
│ concerns (array)           │
│ ingredients (array)        │
│ benefits (array)           │
│ description                │
│ image                      │
│ createdAt, updatedAt       │
└────────────────────────────┘

INDEXES:
✓ Product.category
✓ Product.concerns
✓ SkinProfile.user
✓ SkinProfile.skinType
```

---

This architecture ensures:
- ✅ Fast filtering (indexed queries)
- ✅ Secure allergy handling (comprehensive ingredient check)
- ✅ Relevant recommendations (multi-factor scoring)
- ✅ Scalable design (stateless API, cacheable responses)
