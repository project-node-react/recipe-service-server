import prisma from '../../prisma/client.ts';

export const getAllTestimonials = async () => {
  return prisma.testimonial.findMany({
    orderBy: {
      id: 'asc',
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
};
