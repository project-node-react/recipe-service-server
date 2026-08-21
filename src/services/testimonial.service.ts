import prisma from '../../prisma/client.ts';

export const getAllTestimonials = async () => {
  return prisma.testimonial.findMany({
    orderBy: {
      id: 'asc',
    },
    include: {
      owner: true,
    },
  });
};
