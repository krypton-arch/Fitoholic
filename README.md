# Fitoholic 2.0

Fitoholic is a premium, AI-powered fitness tracking application built specifically for the Indian audience. It combines an editorial, high-end "Zenith" aesthetic (glassmorphism, tailored dark themes, and refined typography) with robust, data-driven fitness tooling.

## Features

* **Premium "Zenith" Design System:** 
  Built from the ground up with a bespoke dark-mode aesthetic. Features glassmorphic cards, subtle borders, hairline dividers, and a strict typographic scale using `Outfit` (Headings) and `Inter` (Body).
* **Live Workout Companion (Gym Mode):**
  A mobile-optimized, offline-tolerant live workout tracker. Powered by Zustand, your session survives network drops and page reloads. Includes swipe-to-delete Framer Motion animations, inline rest timers, and dynamic exercise searching.
* **AI Workout Planner:**
  Powered by Google's Gemini, the AI Planner generates bespoke 7-day training protocols based on your exact goals. 
  * *Smart Integration:* The AI Planner is directly wired into the Live Workout Mode via prompt injection—allowing you to generate an AI routine and instantly launch it at the gym with all target sets and reps pre-loaded.
* **Daily Metric Logging:**
  Track your daily steps, weight, water intake, and active calories with premium interactive data visualizations using Recharts.
* **Authentic Indian Nutrition (INDB):**
  Support for the Indian Nutrient Databank (built off ICMR-NIN IFCT tables) to accurately track over 1,000 authentic regional Indian recipes and ingredients.
* **Premium Subscriptions:**
  Integrated with Razorpay for secure checkout to unlock AI protocols and advanced analytics.

## Tech Stack

* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4, Framer Motion
* **Database:** PostgreSQL (via Prisma ORM)
* **Authentication:** NextAuth.js
* **State Management:** Zustand (with local storage persistence)
* **AI Integration:** Google Generative AI (`@google/generative-ai`)
* **Payments:** Razorpay

---

## Local Setup & Development

### 1. Environment Variables
Create a `.env` file in the root directory and populate it with your keys:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fitoholic"
AUTH_SECRET="your-nextauth-secret"
GEMINI_API_KEY="your-google-gemini-key"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
```

### 2. Database Migration
Ensure PostgreSQL is running locally, then push the schema:
```bash
npx prisma db push
npx prisma generate
```

### 3. INDB Dataset Import (Nutrition)
Due to licensing restrictions on the raw data, the authentic Indian nutrition dataset files are not checked into this repository. To import them locally:

1. Download the following files from the official [INDB GitHub Repo](https://github.com/lindsayjaacks/Indian-Nutrient-Databank-INDB-):
   - `INDB.xlsx`
   - `recipes_names.xlsx`
   - `recipes_servingsize.xlsx`
2. Create a folder named `indb` inside `data/` (i.e., `data/indb/`).
3. Place all 3 Excel files in that folder.
4. Run the import script:
   ```bash
   npm run import:indb
   ```

### 4. Run the Application
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
