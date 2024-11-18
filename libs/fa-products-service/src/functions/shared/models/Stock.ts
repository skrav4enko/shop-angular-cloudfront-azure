import { z } from 'zod';

export interface Stock {
  id: string; // primary and partition
  product_id: string; // primary and partition key
  count: number;
}

const StockSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  count: z.coerce.number(),
});

// extract the inferred type
export type StockZod = z.infer<typeof StockSchema>;

export const validateStock = (stock: unknown): StockZod => {
  return StockSchema.parse(stock);
};
