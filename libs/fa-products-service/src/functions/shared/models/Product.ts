import { z } from 'zod';

export interface Product {
  id: string; // UUID, primary and partition key
  title: string;
  description: string;
  price: number;
}

const ProductStockSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  count: z.number(),
});

// extract the inferred type
export type ProductStockZod = z.infer<typeof ProductStockSchema>;

export const validateProductStock = (product: unknown): ProductStockZod => {
  return ProductStockSchema.parse(product);
};
