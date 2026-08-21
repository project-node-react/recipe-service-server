import { z } from "zod";
import { registry } from "../openapi.ts";

const TestimonialOwnerSchema = z.object({
  id: z.string().openapi({ example: "64c8d958249fae54bae90bb9" }),
  name: z.string().openapi({ example: "ivan_petrenko" }),
  email: z.email().openapi({ example: "ivan@example.com" }),
  avatar: z.string().nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
});

export const TestimonialSchema = registry.register(
  "Testimonial",
  z.object({
    id: z.string().openapi({ example: "testimonial-1" }),
    ownerId: z.string().openapi({ example: "64c8d958249fae54bae90bb9" }),
    testimonial: z
      .string()
      .openapi({ example: "This service changed how I cook every day!" }),
    owner: TestimonialOwnerSchema,
  })
);

registry.registerPath({
  method: "get",
  path: "/api/testimonials",
  tags: ["Testimonials"],
  summary: "Get all testimonials",
  description:
    "Get a list of all testimonials with their owners. Note: this route is " +
    "implemented (testimonial.routes.ts) but is not mounted in app.ts, so it " +
    "is not reachable on the running server yet. Also note the underlying " +
    "service query (`testimonial.service.ts`) does `include: { owner: true }`, " +
    "which pulls the full User row including the password hash — this should " +
    "be scoped to a `select` of public fields before the route is exposed.",
  responses: {
    200: {
      description: "List of all testimonials",
      content: {
        "application/json": {
          schema: z.object({
            status: z.number().openapi({ example: 200 }),
            data: z.array(TestimonialSchema),
          }),
        },
      },
    },
  },
});
