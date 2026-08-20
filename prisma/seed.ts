/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import bcrypt from "bcrypt";
import prisma from "./client.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "seed-data");

interface CategoryRow {
  id: string;
  name: string;
}

interface AreaRow {
  id: string;
  name: string;
}

interface IngredientRow {
  id: string;
  name: string;
  description?: string;
  img?: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

interface RecipeRow {
  id: string;
  title: string;
  categoryId: string;
  areaId: string;
  instructions: string;
  description?: string;
  thumb?: string;
  preview?: string;
  cookingTime: string;
  ownerId: string;
}

interface RecipeIngredientRow {
  recipeId: string;
  ingredientId: string;
  measure: string;
}

interface TestimonialRow {
  id: string;
  ownerId: string;
  testimonial: string;
}

/**
 * Читает CSV-файл и возвращает массив объектов.
 * Отдельно снимает BOM (U+FEFF), который есть в части файлов из выгрузки.
 */
function readCsv<T>(fileName: string): T[] {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as T[];
}

async function seedCategories(): Promise<void> {
  const rows = readCsv<CategoryRow>("categories.csv");
  for (const row of rows) {
    await prisma.category.upsert({
      where: { id: row.id },
      update: { name: row.name },
      create: { id: row.id, name: row.name },
    });
  }
  console.log(`✔ categories: ${rows.length}`);
}

async function seedAreas(): Promise<void> {
  const rows = readCsv<AreaRow>("areas.csv");
  for (const row of rows) {
    await prisma.area.upsert({
      where: { id: row.id },
      update: { name: row.name },
      create: { id: row.id, name: row.name },
    });
  }
  console.log(`✔ areas: ${rows.length}`);
}

async function seedIngredients(): Promise<void> {
  const rows = readCsv<IngredientRow>("ingredients.csv");
  for (const row of rows) {
    await prisma.ingredient.upsert({
      where: { id: row.id },
      update: {
        name: row.name,
        description: row.description || null,
        img: row.img || null,
      },
      create: {
        id: row.id,
        name: row.name,
        description: row.description || null,
        img: row.img || null,
      },
    });
  }
  console.log(`✔ ingredients: ${rows.length}`);
}

async function seedUsers(): Promise<void> {
  const rows = readCsv<UserRow>("users_for_import.csv");
  for (const row of rows) {
    const passwordHash = await bcrypt.hash(row.password, 10);
    await prisma.user.upsert({
      where: { id: row.id },
      update: {
        name: row.name,
        email: row.email,
        password: passwordHash,
        avatar: row.avatar || null,
      },
      create: {
        id: row.id,
        name: row.name,
        email: row.email,
        password: passwordHash,
        avatar: row.avatar || null,
      },
    });
  }
  console.log(`✔ users: ${rows.length} (пароли захешированы)`);
}

async function seedRecipes(): Promise<void> {
  const rows = readCsv<RecipeRow>("recipes_for_import.csv");
  for (const row of rows) {
    const cookingTime = parseInt(row.cookingTime, 10) || 0;
    await prisma.recipe.upsert({
      where: { id: row.id },
      update: {
        title: row.title,
        description: row.description || null,
        instructions: row.instructions,
        thumb: row.thumb || null,
        preview: row.preview || null,
        cookingTime,
        categoryId: row.categoryId,
        areaId: row.areaId,
        ownerId: row.ownerId,
      },
      create: {
        id: row.id,
        title: row.title,
        description: row.description || null,
        instructions: row.instructions,
        thumb: row.thumb || null,
        preview: row.preview || null,
        cookingTime,
        categoryId: row.categoryId,
        areaId: row.areaId,
        ownerId: row.ownerId,
      },
    });
  }
  console.log(`✔ recipes: ${rows.length}`);
}

async function seedRecipeIngredients(): Promise<void> {
  const rows = readCsv<RecipeIngredientRow>(
    "recipe_ingredients_for_import.csv",
  );
  const data = rows.map((row) => ({
    recipeId: row.recipeId,
    ingredientId: row.ingredientId,
    measure: row.measure,
  }));
  const result = await prisma.recipeIngredient.createMany({
    data,
    skipDuplicates: true,
  });
  console.log(
    `✔ recipe_ingredients: вставлено ${result.count} из ${rows.length}`,
  );
}

async function seedTestimonials(): Promise<void> {
  const rows = readCsv<TestimonialRow>("testimonials_for_import.csv");
  for (const row of rows) {
    await prisma.testimonial.upsert({
      where: { id: row.id },
      update: { ownerId: row.ownerId, testimonial: row.testimonial },
      create: {
        id: row.id,
        ownerId: row.ownerId,
        testimonial: row.testimonial,
      },
    });
  }
  console.log(`✔ testimonials: ${rows.length}`);
}

async function main(): Promise<void> {
  console.log("Сидирование базы данных запущено...");
  await seedUsers();
  await seedCategories();
  await seedAreas();
  await seedIngredients();
  await seedRecipes();
  await seedRecipeIngredients();
  await seedTestimonials();
  console.log("Готово ✅");
}

main()
  .catch((err) => {
    console.error("Ошибка сидирования:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
