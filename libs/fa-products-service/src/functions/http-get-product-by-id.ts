import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';

import { getProductById, ProductDto } from './db/products-db';

export async function productByIdHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const productId = request.params.productId;

  if (!productId) {
    context.error(`Invalid product id: ${productId}`);

    return {
      status: 400,
      body: 'Please pass a valid product id',
    };
  }

  let product: ProductDto | null;

  try {
    product = await getProductById(productId);

    context.info(`Got product: ${productId}`);
  } catch (error) {
    context.error('Error getting product', error);

    return {
      status: 500,
      body: 'Error getting product',
    };
  }

  if (!product) {
    context.error(`Product not found: ${productId}`);

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
