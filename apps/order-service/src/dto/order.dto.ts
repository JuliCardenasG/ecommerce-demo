import { z } from 'zod';

export enum OrderStatus {
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  SHIPPING = 'SHIPPING',
  SHIPPED = 'SHIPPED',
}

export const createOrderDto = z.object({
  price: z.number().positive('Price must be a positive number'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  productId: z.string().min(1, 'Product ID is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  sellerId: z.string().min(1, 'Seller ID is required'),
});

export const updateOrderDto = z.object({
  status: z
    .enum([
      OrderStatus.CREATED,
      OrderStatus.ACCEPTED,
      OrderStatus.REJECTED,
      OrderStatus.SHIPPING,
      OrderStatus.SHIPPED,
    ])
    .optional(),
  price: z.number().positive('Price must be a positive number').optional(),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be a positive integer')
    .optional(),
  productId: z.string().min(1, 'Product ID is required').optional(),
  customerId: z.string().min(1, 'Customer ID is required').optional(),
  sellerId: z.string().min(1, 'Seller ID is required').optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderDto>;
export type UpdateOrderDto = z.infer<typeof updateOrderDto>;
