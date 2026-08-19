import prisma from "../../prisma/client.ts";

export const getAllCategories = async () => {
  // Переконайся, що в schema.prisma є модель Category
  return await prisma.category.findMany(); 
};