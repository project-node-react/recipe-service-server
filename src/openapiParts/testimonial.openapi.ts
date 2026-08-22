import { z } from 'zod';

import { registry } from '../openapi.ts';

export const TestimonialSchema = registry.register(
  'Testimonial',
  z.object({
    id: z.string().openapi({
      example: '647495d0c825f1570b04182d',
    }),
    testimonial: z.string().openapi({
      example: 'I really enjoyed these recipes!',
    }),
    owner: z.object({
      id: z.string().openapi({
        example: '64c8d958249fae54bae90bb8',
      }),
      name: z.string().openapi({
        example: 'Anna',
      }),
    }),
  }),
);

export type Testimonial = z.infer<typeof TestimonialSchema>;

registry.registerPath({
  method: 'get',
  path: '/api/testimonials',
  tags: ['Testimonials'],
  summary: 'Get all testimonials',
  description: 'Returns all testimonials.',
  responses: {
    200: {
      description: 'Testimonials successfully retrieved',
      content: {
        'application/json': {
          schema: z.object({
            status: z.number().openapi({
              example: 200,
            }),
            data: z.array(TestimonialSchema),
          }),
        },
      },
    },
  },
});
