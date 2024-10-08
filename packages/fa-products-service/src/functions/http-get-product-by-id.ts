import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { products } from '../shared/mocks/products';

export async function productByIdFn(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processed a request.');

  const productId = Number(request.params.productId);

  if (!productId) {
    return {
      status: 400,
      body: 'Please pass a valid product id',
    };
  }

  const product = products.find((p) => p.id === productId);

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
  route: 'products/{productId}',
  handler: productByIdFn,
});
