import { z } from "zod";
import { registry } from "../openapi.ts";
import { PaginationQuerySchema } from "./common.validator.ts";

export const RecipesQuerySchema = PaginationQuerySchema.extend({
	category: z.string().trim().optional(),
	ingredient: z.string().trim().optional(),
	area: z.string().trim().optional(),
});
export type RecipesQuery = z.infer<typeof RecipesQuerySchema>;

export const PopularQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(20).default(4),
});
export type PopularQuery = z.infer<typeof PopularQuerySchema>;

const IngredientInputSchema = z.object({
	id: z.string().min(1, "ingredient id is required"),
	measure: z.string().trim().min(1, "measure is required"),
});

// multipart/form-data приходит как строки, поэтому ingredients ожидаем как
// JSON-строку вида '[{"id":"...","measure":"..."}]' и парсим её через preprocess.
export const CreateRecipeSchema = registry.register(
	"CreateRecipe",
	z.object({
		title: z.string().trim().min(1).max(200).openapi({ example: "Borscht" }),
		description: z.string().trim().max(500).optional(),
		instructions: z.string().trim().min(1),
		category: z.string().min(1, "category id is required"),
		area: z.string().min(1, "area id is required"),
		time: z.coerce
			.number()
			.int()
			.min(1, "cooking time must be at least 1 minute"),
		ingredients: z.preprocess(
			(val) => {
				if (typeof val === "string") {
					try {
						return JSON.parse(val);
					} catch {
						return val;
					}
				}
				return val;
			},
			z
				.array(IngredientInputSchema)
				.min(1, "at least one ingredient is required"),
		),
	}),
);
export type CreateRecipeBody = z.infer<typeof CreateRecipeSchema>;

registry.registerPath({
	method: "get",
	path: "/api/recipes",
	tags: ["Recipes"],
	summary: "Search recipes (filters + pagination)",
	responses: { 200: { description: "Paginated list of recipes" } },
});

registry.registerPath({
	method: "get",
	path: "/api/recipes/popular",
	tags: ["Recipes"],
	summary: "Most favorited recipes",
	responses: { 200: { description: "List of popular recipes" } },
});

registry.registerPath({
	method: "get",
	path: "/api/recipes/{id}",
	tags: ["Recipes"],
	summary: "Get recipe details by id",
	responses: {
		200: { description: "Recipe details" },
		404: { description: "Recipe not found" },
	},
});

registry.registerPath({
	method: "post",
	path: "/api/recipes",
	tags: ["Recipes"],
	summary: "Create a new recipe",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: { "multipart/form-data": { schema: CreateRecipeSchema } },
		},
	},
	responses: {
		201: { description: "Recipe created" },
		400: { description: "Unknown category/area/ingredient id" },
	},
});
