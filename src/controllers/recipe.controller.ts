import createHttpError from 'http-errors';
import type { Request, Response } from 'express';
import prisma from '../../prisma/client.ts';
import { uploadToCloudinary } from '../services/cloudinary.ts';
import type { IdParams } from '../validators/common.validator.ts';
import type {
  RecipesQuery,
  PopularQuery,
  CreateRecipeBody,
} from '../validators/recipe.validator.ts';
import type { PaginationQuery } from '../validators/common.validator.ts';

const cardSelect = {
  id: true,
  title: true,
  description: true,
  thumb: true,
  cookingTime: true,
  category: { select: { id: true, name: true } },
  area: { select: { id: true, name: true } },
  owner: { select: { id: true, name: true, avatar: true } },
} as const;

function buildPagination(page: number, limit: number, totalItems: number, data: unknown[]) {
  return { page, limit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)), data };
}

export const getRecipes = async (req: Request, res: Response<any, { query: RecipesQuery }>) => {
  const { category, ingredient, area, page, limit } = res.locals.query;
  const skip = (page - 1) * limit;

  const where = {
    ...(category ? { categoryId: category } : {}),
    ...(area ? { areaId: area } : {}),
    ...(ingredient ? { ingredients: { some: { ingredientId: ingredient } } } : {}),
  };

  const [totalItems, data] = await Promise.all([
    prisma.recipe.count({ where }),
    prisma.recipe.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: cardSelect,
    }),
  ]);

  res.status(200).json(buildPagination(page, limit, totalItems, data));
};

export const getPopularRecipes = async (
  req: Request,
  res: Response<any, { query: PopularQuery }>,
) => {
  const { limit } = res.locals.query;

  const recipes = await prisma.recipe.findMany({
    take: limit,
    orderBy: { favoritedBy: { _count: 'desc' } },
    select: { ...cardSelect, _count: { select: { favoritedBy: true } } },
  });

  res
    .status(200)
    .json(recipes.map((r) => ({ ...r, favoritesCount: r._count.favoritedBy, _count: undefined })));
};

export const getRecipeById = async (req: Request<IdParams>, res: Response) => {
  const { id } = req.params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      area: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, avatar: true } },
      ingredients: {
        select: { measure: true, ingredient: { select: { id: true, name: true, img: true } } },
      },
    },
  });

  if (!recipe) throw createHttpError(404, 'Recipe not found');

  res.status(200).json({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    instructions: recipe.instructions,
    thumb: recipe.thumb,
    preview: recipe.preview,
    cookingTime: recipe.cookingTime,
    category: recipe.category,
    area: recipe.area,
    owner: recipe.owner,
    ingredients: recipe.ingredients.map((ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      img: ri.ingredient.img,
      measure: ri.measure,
    })),
  });
};

export const getOwnRecipes = async (
  req: Request,
  res: Response<any, { query: PaginationQuery }>,
) => {
  const { page, limit } = res.locals.query;
  const skip = (page - 1) * limit;
  const where = { ownerId: req.user!.id };

  const [totalItems, data] = await Promise.all([
    prisma.recipe.count({ where }),
    prisma.recipe.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: cardSelect,
    }),
  ]);

  res.status(200).json(buildPagination(page, limit, totalItems, data));
};

export const createRecipe = async (req: Request<{}, {}, CreateRecipeBody>, res: Response) => {
  const { title, description, instructions, category, area, time, ingredients } = req.body;

  const [categoryExists, areaExists] = await Promise.all([
    prisma.category.findUnique({ where: { id: category } }),
    prisma.area.findUnique({ where: { id: area } }),
  ]);
  if (!categoryExists) throw createHttpError(400, 'Unknown category id');
  if (!areaExists) throw createHttpError(400, 'Unknown area id');

  const ingredientIds = ingredients.map((i) => i.id);
  const foundIngredients = await prisma.ingredient.findMany({
    where: { id: { in: ingredientIds } },
    select: { id: true },
  });
  if (foundIngredients.length !== ingredientIds.length) {
    throw createHttpError(400, 'One or more ingredient ids are unknown');
  }

  const thumb = req.file ? await uploadToCloudinary(req.file.path, 'foodies/recipes') : null;

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      instructions,
      thumb,
      cookingTime: time,
      categoryId: category,
      areaId: area,
      ownerId: req.user!.sub!,
      ingredients: { create: ingredients.map((i) => ({ ingredientId: i.id, measure: i.measure })) },
    },
    include: {
      category: { select: { id: true, name: true } },
      area: { select: { id: true, name: true } },
      ingredients: { include: { ingredient: true } },
    },
  });

  res.status(201).json(recipe);
};

export const deleteRecipe = async (req: Request<IdParams>, res: Response) => {
  const { id } = req.params;

  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) throw createHttpError(404, 'Recipe not found');
  if (recipe.ownerId !== req.user!.id) {
    throw createHttpError(403, 'You can only delete your own recipes');
  }

  await prisma.recipe.delete({ where: { id } });
  res.status(204).send();
};

export const getFavoriteRecipes = async (
  req: Request,
  res: Response<any, { query: PaginationQuery }>,
) => {
  const { page, limit } = res.locals.query;
  const skip = (page - 1) * limit;
  const where = { userId: req.user!.id };

  const [totalItems, rows] = await Promise.all([
    prisma.favorite.count({ where }),
    prisma.favorite.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { recipe: { select: cardSelect } },
    }),
  ]);

  res.status(200).json(
    buildPagination(
      page,
      limit,
      totalItems,
      rows.map((r) => r.recipe),
    ),
  );
};

export const addFavorite = async (req: Request<IdParams>, res: Response) => {
  const { id: recipeId } = req.params;

  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) throw createHttpError(404, 'Recipe not found');

  await prisma.favorite.upsert({
    where: { userId_recipeId: { userId: req.user!.id, recipeId } },
    update: {},
    create: { userId: req.user!.id, recipeId },
  });

  res.status(204).send();
};

export const removeFavorite = async (req: Request<IdParams>, res: Response) => {
  const { id: recipeId } = req.params;

  await prisma.favorite
    .delete({ where: { userId_recipeId: { userId: req.user!.id, recipeId } } })
    .catch(() => null);

  res.status(204).send();
};
