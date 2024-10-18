import { UUID } from 'crypto';

export interface Product {
  id: UUID | number;
  title: string;
  description: string;
  price: number;
  count: number;
}
