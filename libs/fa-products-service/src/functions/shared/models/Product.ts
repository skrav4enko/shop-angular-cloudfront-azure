export interface Product {
  id: string; // UUID, primary and partition key
  title: string;
  description: string;
  price: number;
}
