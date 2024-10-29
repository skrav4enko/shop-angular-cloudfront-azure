import { OperationInput } from '@azure/cosmos';
import { faker } from '@faker-js/faker';

import { Product } from '../shared/models/Product';
import { Stock } from '../shared/models/Stock';
import { CosmosDb } from './client';

const productsAmount = 3;

const generateProductsIds = (amount: number): string[] => {
  return Array.from({ length: amount }, () => faker.string.uuid());
};

const generateProduct = (id: string): Product => {
  return {
    id,
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
  };
};

const generateStock = (productId: string): Stock => {
  return {
    id: productId,
    product_id: productId,
    count: faker.number.int({ min: 1, max: 10 }),
  };
};

async function seed() {
  const productsIds = generateProductsIds(productsAmount);
  const productsOperations: OperationInput[] = productsIds.map((id) => {
    return {
      operationType: 'Upsert',
      resourceBody: { ...generateProduct(id) },
    };
  });
  const stockOperations: OperationInput[] = productsIds.map((id) => {
    return {
      operationType: 'Upsert',
      resourceBody: { ...generateStock(id) },
    };
  });

  await CosmosDb.getProductsContainer().items.bulk(productsOperations);
  await CosmosDb.getStocksContainer().items.bulk(stockOperations);
}

seed()
  .then(() => {
    console.log('Seeding db is done');
  })
  .catch((e) => {
    console.error(e);
    console.log('Something went wrong while seeding db');
  });
