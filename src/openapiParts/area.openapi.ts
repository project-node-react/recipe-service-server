import { z } from 'zod';

import { registry } from '../openapi.ts';

export const AreaSchema = registry.register(
  'Area',
  z.object({
    id: z.string().openapi({
      example: '6462a6f04c3d0ddd28897fa5',
    }),
    name: z.string().openapi({
      example: 'American',
    }),
  }),
);

export type Area = z.infer<typeof AreaSchema>;

export const AreaIdParamsSchema = registry.register(
  'AreaIdParams',
  z.object({
    id: z.string().openapi({
      example: '1',
      description: 'ID of the area to fetch',
    }),
  }),
);

export type AreaIdParams = z.infer<typeof AreaIdParamsSchema>;

registry.registerPath({
  method: 'get',
  path: '/api/areas',
  tags: ['Areas'],
  summary: 'Get all areas',
  description: 'Returns all recipe areas.',
  responses: {
    200: {
      description: 'Areas successfully retrieved',
      content: {
        'application/json': {
          schema: z.object({
            status: z.number().openapi({
              example: 200,
            }),
            data: z.array(AreaSchema),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/areas/{id}',
  tags: ['Areas'],
  summary: 'Get area by ID',
  description: 'Returns an area by its ID.',
  request: {
    params: AreaIdParamsSchema,
  },
  responses: {
    200: {
      description: 'Area successfully retrieved',
      content: {
        'application/json': {
          schema: z.object({
            status: z.number().openapi({
              example: 200,
            }),
            data: AreaSchema,
          }),
        },
      },
    },
    404: {
      description: 'Area not found',
      content: {
        'application/json': {
          schema: z.object({
            status: z.number().openapi({
              example: 404,
            }),
            message: z.string().openapi({
              example: 'Area not found',
            }),
          }),
        },
      },
    },
  },
});
