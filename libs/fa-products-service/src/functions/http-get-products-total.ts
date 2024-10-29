import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { getProductsTotal } from './db/products-db';

export async function productsTotalHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  let totalCount: number;

  try {
    totalCount = await getProductsTotal();

    context.info(`Got products total: ${totalCount}`);
  } catch (error) {
    context.error('Error getting products total', error);

    return {
      status: 500,
      body: 'Error getting products total',
    };
  }

  return {
    // status: 200, /* Defaults to 200 */
    jsonBody: {
      total: totalCount,
    },
  };
}

app.http('productsTotal', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'products/total',
  handler: productsTotalHandler,
});
