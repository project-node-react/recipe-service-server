import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Recipe Service API",
      version: "1.0.0",
      description:
        "REST API for the Foodies/Recipe Service project: authentication, users " +
        "(profiles, avatars, follows), recipes (search, favorites, own recipes), " +
        "categories and ingredients. Endpoints marked as 'not mounted' exist in " +
        "the codebase but are not currently wired into app.ts, so they are not " +
        "reachable on the running server.",
    },
    servers: [{ url: "http://localhost:3000", description: "Local development server" }],
    tags: [
      { name: "Auth", description: "Registration, login and token management" },
      { name: "Users", description: "User profiles, avatars and follow relationships" },
      { name: "Recipes", description: "Recipe search, details, favorites and ownership" },
      { name: "Categories", description: "Recipe categories" },
      { name: "Ingredients", description: "Recipe ingredients" },
      { name: "Areas", description: "Cuisine areas (routes not currently mounted)" },
      { name: "Testimonials", description: "User testimonials (routes not currently mounted)" },
    ],
  });
}
