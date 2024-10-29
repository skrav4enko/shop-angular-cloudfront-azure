import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { getProducts, ProductDto } from './db/products-db';

export async function productsHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  let products: ProductDto[];

  try {
    products = await getProducts();

    context.info(`Got products: ${products.length}`);
  } catch (error) {
    context.error('Error getting products', error);

    return {
      status: 500,
      body: 'Error getting products',
    };
  }

  return {
    // status: 200, /* Defaults to 200 */
    jsonBody: products,
  };
}

app.http('productList', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'products',
  handler: productsHandler,
});
