import { z } from 'zod';

export const uploadInvoiceDto = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  sellerId: z.string().min(1, 'Seller ID is required'),
});

export type UploadInvoiceDto = z.infer<typeof uploadInvoiceDto>;
