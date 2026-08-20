import prisma from '../../prisma/client.ts';

export const getAllAreas = async () => {
  return prisma.area.findMany({
    orderBy: {
      name: 'asc',
    },
  });
};

export const getAreaById = async (id: string) => {
  return prisma.area.findUnique({
    where: {
      id,
    },
  });
};
