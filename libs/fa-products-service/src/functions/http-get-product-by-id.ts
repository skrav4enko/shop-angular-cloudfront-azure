import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { products } from './shared/mocks/products';

import { AppConfigurationClient } from '@azure/app-configuration';

const connection_string = process.env.AZURE_APP_CONFIG_CONNECTION_STRING;
const client = new AppConfigurationClient(connection_string);
const exampleKey = client.getConfigurationSetting({
  key: 'DATA_FROM_APP_CONFIG',
});

export async function productByIdHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const { value } = await exampleKey;
  context.log(`App Configuration variable: ${value}`);

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
  handler: productByIdHandler,
});
