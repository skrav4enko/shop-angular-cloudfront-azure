import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { getProducts } from './db/products-db';

export async function productsHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const products = await getProducts();

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
