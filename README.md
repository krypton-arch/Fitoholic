# Fitoholic

Fitoholic is a premium fitness tracking application built specifically for the Indian audience.

## INDB Dataset Import

We use the **Indian Nutrient Databank (INDB)** for authentic Indian food tracking (built off the ICMR-NIN IFCT tables). Due to licensing restrictions on the raw data, the dataset files are not checked into this repository.

To import the INDB dataset (1,014 authentic Indian recipes) into your local database:

1. Download the following files from the official repository: [INDB GitHub Repo](https://github.com/lindsayjaacks/Indian-Nutrient-Databank-INDB-)
   - `INDB.xlsx`
   - `recipes_names.xlsx`
   - `recipes_servingsize.xlsx`
2. Create a folder named `indb` inside `d:\Project\Fitoholic 2.0\data\` (i.e. `data/indb/`).
3. Place all 3 Excel files in that folder.
4. Run the import script:
   ```bash
   npm run import:indb
   ```
This script will parse the excel files, resolve data quirks, and cleanly insert them into your local Postgres database.

---

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
