import { z } from "zod";
import { registry } from "../openapi.ts";

export const IngredientSchema = registry.register(
  "Ingredient",
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    img: z.string().nullable(),
  })
);

registry.registerPath({
  method: "get",
  path: "/api/ingredients",
  tags: ["Ingredients"],
  summary: "Get all ingredients",
  responses: {
    200: {
      description: "List of all ingredients",
      content: { "application/json": { schema: z.array(IngredientSchema) } },
    },
  },
});