import { z } from "zod";
import { registry } from "../openapi.ts";

export const CategorySchema = registry.register(
  "Category",
  z.object({
    id: z.string(),
    name: z.string(),
  })
);

registry.registerPath({
  method: "get",
  path: "/api/categories",
  tags: ["Categories"],
  summary: "Get all categories",
  description: "Get a list of all categories",
  responses: {
    200: {
      description: "List of all categories",
      content: {
        "application/json": {
          schema: z.array(CategorySchema),
        },
      },
    },
  },
});