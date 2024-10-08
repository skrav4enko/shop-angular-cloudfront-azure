import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { products } from '../shared/mocks/products';

export async function productsHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

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
