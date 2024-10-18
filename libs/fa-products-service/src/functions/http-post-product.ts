import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { randomUUID } from 'crypto';
import { products } from './shared/mocks/products';
import { Product } from './shared/models/Product';

export async function createProductHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const body: Partial<Product> = await request.json();

  context.info(`Http function processed post request with data: `, body);

  const newProduct: Product = {
    id: randomUUID(),
    title: body.title ?? 'Default Title', // Ensure title is provided
    description: body.description ?? 'Default Description', // Ensure description is provided
    price: body.price ?? 0, // Ensure price is provided
    count: body.count ?? 0, // Ensure count is provided
  };

  context.info('Created product entity');

  // const stock: StockEntity = {
  //   id,
  //   product_id: id,
  //   count: productDto.count,
  // };

  products.push(newProduct);

  context.info('Created stock entity');

  return {
    status: 201,
    jsonBody: JSON.stringify(newProduct),
  };
}

app.http('create-product', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'products',
  handler: createProductHandler,
});
