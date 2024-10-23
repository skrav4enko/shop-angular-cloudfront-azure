import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';

import { getProductById } from './db/products-db';

export async function productByIdHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const productId = request.params.productId;

  if (!productId) {
    return {
      status: 400,
      body: 'Please pass a valid product id',
    };
  }

  const product = await getProductById(productId);

  if (!product) {
    return {
      status: 404,
      body: 'Product not found',
    };
  }

  return {
    // status: 200, /* Defaults to 200 */
    jsonBody: { product },
  };
}

app.http('productById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'products/{productId:guid}',
  handler: productByIdHandler,
});
