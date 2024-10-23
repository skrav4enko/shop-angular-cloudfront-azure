import { faker } from '@faker-js/faker/.';
import { Product } from '../models/Product';
import { Stock } from '../models/Stock';

export const products: Array<Product & Pick<Stock, 'count'>> = [
  {
    id: faker.string.uuid(),
    title: 'Laptop',
    description: 'A high-performance laptop for professionals.',
    price: 999.99,
    count: 5,
  },
  {
    id: faker.string.uuid(),
    title: 'Smartphone',
    description: 'A latest model smartphone with advanced features.',
    price: 699.99,
    count: 10,
  },
  {
    id: faker.string.uuid(),
    title: 'Headphones',
    description: 'Noise-cancelling over-ear headphones.',
    price: 199.99,
    count: 15,
  },
  {
    id: faker.string.uuid(),
    title: 'Coffee Maker',
    description: 'Automatic coffee maker with programmable settings.',
    price: 90,
    count: 7,
  },
  {
    id: faker.string.uuid(),
    title: 'Electric Kettle',
    description: 'Fast boiling electric kettle with temperature control.',
    price: 49.99,
    count: 12,
  },
  {
    id: faker.string.uuid(),
    title: 'Gaming Mouse',
    description: 'Ergonomic gaming mouse with customizable buttons.',
    price: 59.99,
    count: 20,
  },
  {
    id: faker.string.uuid(),
    title: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with high-quality sound.',
    price: 129.99,
    count: 8,
  },
];
