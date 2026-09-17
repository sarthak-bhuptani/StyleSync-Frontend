# Master Prompt: Build StyleSync Production Backend

> **Copy & paste the prompt below into ChatGPT, Claude 3.7 / Sonnet, Cursor, or your AI tool of choice to build the complete backend for StyleSync.**

---

```markdown
You are an expert Senior Backend Engineer & AI Systems Architect.
Build a production-ready, high-performance Node.js / Express (or Python / FastAPI) REST API backend for "StyleSync — AI Personal Shopping Advisor".

### 1. Project Overview & Core Mission
StyleSync answers: "Will this product actually suit me before I buy it?"
The backend evaluates shopping screenshots, clothing, shoes, eyewear, and accessories against:
1. User Physical Traits: Face Shape (Oval, Square, Round, etc.), Skin Undertone (Warm Golden, Cool Rosy, Olive), and Body Silhouette (Athletic V-Taper, Lean Rectangle, etc.).
2. User Capsule Wardrobe: Cross-referencing existing user wardrobe items to calculate outfit versatility.
3. User Budget & Occasions: Checking category price ceilings and color avoidance lists.

---

### 2. Tech Stack Requirements
- Runtime: Node.js (v20+) with Express (ES Modules) OR Python 3.11 with FastAPI
- Database: MongoDB (with Mongoose) OR PostgreSQL (with Prisma / Drizzle)
- Authentication: JWT (JsonWebToken) with bcrypt password hashing + auth middleware
- AI Vision & Chat Engine:
  - Google Gemini 2.0 Flash / 1.5 Pro Vision (`@google/genai` or `@google/generative-ai`) OR OpenAI GPT-4o Vision (`openai`)
- File Storage / Upload: Multer + Cloudinary (or AWS S3) for product screenshots and selfies
- OpenAPI / Swagger: Integrated Swagger UI documentation at `/api-docs` using the provided `docs/swagger.yaml`

---

### 3. API Contract Specification (Base URL: `/api/v1`)

#### A. Authentication (`/api/v1/auth`)
- `POST /auth/register` — Register user `{ name, email, password }` -> returns `{ success, token, user }`
- `POST /auth/login` — Login user `{ email, password }` -> returns `{ success, token, user }`
- `GET /auth/me` — Authenticated session lookup (Bearer JWT)
- `POST /auth/forgot-password` — Password reset link dispatch

#### B. User Profile & AI Physical Calibration (`/api/v1/profile`)
- `GET /profile` — Get full user profile, sizes, colors, budget, and physical traits
- `PUT /profile` — Update user styling preferences, brand preferences, sizes, and avoid-colors
- `POST /profile/onboarding` — Complete 6-step personalized setup
- `POST /profile/scan-face-body` — Upload selfie/portrait photo:
  - Calls Gemini / GPT-4o Vision to detect Face Shape (`Oval`, `Square`, `Round`, `Heart`), Skin Undertone (`Warm Golden`, `Cool Rosy`, `Olive`), Color Season (`Warm Autumn`, `Cool Winter`), and Body Build (`Athletic V-Taper`, `Lean Rectangle`).

#### C. Capsule Wardrobe (`/api/v1/wardrobe`)
- `GET /wardrobe` — Get all wardrobe items (with optional `?category=Tops` filter)
- `POST /wardrobe` — Add new item `{ name, category, brand, color, price, image }`
- `PUT /wardrobe/:id` — Edit wardrobe item / update wear count
- `DELETE /wardrobe/:id` — Remove item from wardrobe

#### D. Product Advisor & Vision AI (`/api/v1/products`)
- `POST /products/analyze` (FLAGSHIP ENDPOINT):
  - Accepts: `{ image, name, brand, category, price, color, description }`
  - Injects User Context: User face shape, skin undertone, body type, budget limits, avoid colors, and existing wardrobe items.
  - Sends Multimodal Prompt to Gemini / GPT-4o Vision:
    "Analyze this product against the user's physical attributes (Face: {faceShape}, Complexion: {skinUndertone}, Build: {bodyType}) and wardrobe ({wardrobeItems}).
    Check if the color clashes with {avoidColors} or exceeds budget {budgetLimits}.
    Return valid JSON with:
    {
      score: number (0-100),
      decision: 'BUY' | 'MAYBE' | 'SKIP',
      confidence: '95%',
      breakdown: {
        styleMatch: { score, max: 25 },
        colorMatch: { score, max: 20 },
        wardrobeMatch: { score, max: 20 },
        versatility: { score, max: 15 },
        budget: { score, max: 10 },
        occasion: { score, max: 10 }
      },
      aiExplanation: string,
      strongMatches: string[],
      considerations: string[],
      compatibleWardrobeIds: string[],
      physicalHarmony: {
        faceMatch: string,
        complexionMatch: string,
        bodyMatch: string
      }
    }"
  - Validates non-apparel images (if image is a cartoon/meme/car, returns `decision: SKIP`, `score: 15`).
  - Saves to database and returns the result object.
- `GET /products` — Get list of evaluated products
- `GET /products/:id` — Get single product result

#### E. AI Outfit Builder (`/api/v1/outfits`)
- `GET /outfits` — Get saved outfits
- `POST /outfits/generate` — Generate 4-piece outfit `{ occasion, weather, style }` from user's actual database wardrobe items with match score.

#### F. Purchase History & Feedback Loop (`/api/v1/purchases`)
- `GET /purchases` — Purchase ledger
- `POST /purchases` — Record purchase `{ productName, price, category, buyWiseScore, notes, image }`
- `PATCH /purchases/:id/feedback` — Update `{ feedback: 'good' | 'bad', rating: 1-5 }` to refine AI prompt memory.

#### G. Shopping Budget (`/api/v1/budget`)
- `GET /budget` — Monthly budget allocation, spent amount, category totals, and 6-month trends
- `PATCH /budget/limit` — Update monthly spending ceiling `{ limit }`

#### H. AI Chat Assistant (`/api/v1/chat`)
- `POST /chat/message` — Conversational AI stylist using user profile + wardrobe context to provide instant fashion advice.

---

### 4. Implementation Guidelines
1. Clean Layered Architecture:
   ```
   src/
   ├── config/ (db.js, ai.js, env.js)
   ├── controllers/ (authController, profileController, wardrobeController, productController, outfitController, budgetController, chatController)
   ├── models/ (User, WardrobeItem, AnalyzedProduct, Outfit, Purchase, Budget)
   ├── routes/ (authRoutes, profileRoutes, wardrobeRoutes, productRoutes, outfitRoutes, purchaseRoutes, budgetRoutes, chatRoutes)
   ├── middlewares/ (authMiddleware, errorHandler, uploadMiddleware)
   ├── services/ (geminiVisionService, promptTemplates)
   └── server.js
   ```
2. Include `.env.example` with:
   - `PORT=5000`
   - `MONGODB_URI=mongodb://localhost:27017/stylesync`
   - `JWT_SECRET=your_jwt_secret_key`
   - `GEMINI_API_KEY=your_gemini_api_key`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. Add CORS configured for `http://localhost:5173` (the Vite frontend).
4. Provide full, working, copy-pasteable code for all controllers, models, and AI service files without placeholder comments.
```
