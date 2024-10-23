export interface Stock {
  id: string; // primary and partition
  product_id: string; // primary and partition key
  count: number;
}
