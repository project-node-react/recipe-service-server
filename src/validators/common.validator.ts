import { z } from "zod";
import { registry } from "../openapi.ts";

export const PaginationQuerySchema = registry.register(
  "PaginationQuery",
  z.object({
    page: z.coerce.number().int().min(1).default(1).openapi({ example: 1 }),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(12)
      .openapi({ example: 12 }),
  }),
);
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const IdParamsSchema = registry.register(
  "IdParams",
  z.object({
    id: z.string().min(1).openapi({ example: "64c8d958249fae54bae90bb9" }),
  }),
);
export type IdParams = z.infer<typeof IdParamsSchema>;
