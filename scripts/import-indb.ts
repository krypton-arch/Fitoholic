import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';

export function parseNutrientValue(value: any): number | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  const lowerStr = str.toLowerCase();
  if (lowerStr === 'tr') return 0;
  if (lowerStr === 'n' || lowerStr === 'na' || str === '-') return null;
  if (str === '') return null;
  const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return null;
  return num;
}

export function parseCompoundName(rawName: string): { name: string; alias: string | null } {
  if (!rawName) return { name: 'Unknown', alias: null };
  const str = String(rawName).trim();
  const match = str.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return {
      name: match[1].trim(),
      alias: match[2].trim(),
    };
  }
  return {
    name: str,
    alias: null,
  };
}

function findKey(row: any, keywords: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    for (const kw of keywords) {
      if (lowerKey.includes(kw.toLowerCase())) return key;
    }
  }
  return undefined;
}

async function processRows(rows: any[], category: string = 'general', prisma: PrismaClient) {
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const nameKey = findKey(row, ['name', 'recipe', 'food']);
    if (!nameKey) continue;

    const rawName = row[nameKey];
    if (!rawName) continue;

    const { name, alias } = parseCompoundName(rawName);

    const caloriesKey = findKey(row, ['energy', 'calories', 'kcal']);
    const proteinKey = findKey(row, ['protein']);
    const carbsKey = findKey(row, ['carbohydrate', 'carb']);
    const fatKey = findKey(row, ['fat', 'lipid']);
    const fiberKey = findKey(row, ['fiber', 'fibre']);
    const servingKey = findKey(row, ['serving', 'portion']);

    const caloriesPer100g = caloriesKey ? parseNutrientValue(row[caloriesKey]) ?? 0 : 0;
    const proteinG = proteinKey ? parseNutrientValue(row[proteinKey]) ?? 0 : 0;
    const carbsG = carbsKey ? parseNutrientValue(row[carbsKey]) ?? 0 : 0;
    const fatG = fatKey ? parseNutrientValue(row[fatKey]) ?? 0 : 0;
    const fiberG = fiberKey ? parseNutrientValue(row[fiberKey]) : null;
    const servingSizeG = servingKey ? parseNutrientValue(row[servingKey]) : null;

    const existingFood = await prisma.food.findFirst({
      where: { name, source: 'INDB' }
    });

    let foodId;
    if (existingFood) {
      const updatedFood = await prisma.food.update({
        where: { id: existingFood.id },
        data: {
          caloriesPer100g,
          proteinG,
          carbsG,
          fatG,
          fiberG,
          servingSizeG,
          category: existingFood.category || category
        }
      });
      foodId = updatedFood.id;
      updated++;
    } else {
      const newFood = await prisma.food.create({
        data: {
          name,
          source: 'INDB',
          caloriesPer100g,
          proteinG,
          carbsG,
          fatG,
          fiberG,
          servingSizeG,
          category
        }
      });
      foodId = newFood.id;
      created++;
    }

    if (alias) {
      const existingAlias = await prisma.foodAlias.findFirst({
        where: { foodId, alias }
      });
      if (!existingAlias) {
        await prisma.foodAlias.create({
          data: { foodId, alias }
        });
      }
    }
  }

  return { created, updated };
}

async function main() {
  const prisma = new PrismaClient();
  const dataDir = path.resolve(__dirname, '../data/indb');
  
  if (!fs.existsSync(dataDir)) {
    console.warn(`Data directory not found at ${dataDir}. Creating it. Please download and place INDB files there.`);
    fs.mkdirSync(dataDir, { recursive: true });
    await prisma.$disconnect();
    return;
  }

  const indbPath = path.join(dataDir, 'INDB.xlsx');
  const namesPath = path.join(dataDir, 'recipes_names.xlsx');
  const servingPath = path.join(dataDir, 'recipes_servingsize.xlsx');

  const filesToCheck = [
    { path: indbPath, name: 'INDB.xlsx' },
    { path: namesPath, name: 'recipes_names.xlsx' },
    { path: servingPath, name: 'recipes_servingsize.xlsx' }
  ];

  let anyFileExists = false;
  for (const file of filesToCheck) {
    if (fs.existsSync(file.path)) {
      anyFileExists = true;
      break;
    }
  }

  if (!anyFileExists) {
    console.warn(`No INDB data files found in ${dataDir}. Please download the files (INDB.xlsx, recipes_names.xlsx, recipes_servingsize.xlsx) to import.`);
    await prisma.$disconnect();
    return;
  }

  let totalCreated = 0;
  let totalUpdated = 0;

  for (const file of filesToCheck) {
    if (fs.existsSync(file.path)) {
      console.log(`Reading ${file.name}...`);
      try {
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        console.log(`Processing ${rows.length} rows from ${file.name}...`);
        const { created, updated } = await processRows(rows, file.name.replace('.xlsx', ''), prisma);
        totalCreated += created;
        totalUpdated += updated;
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
      }
    } else {
      console.log(`File ${file.name} not found. Skipping.`);
    }
  }

  console.log('--- Import Summary ---');
  console.log(`Total created: ${totalCreated}`);
  console.log(`Total updated: ${totalUpdated}`);
  
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
