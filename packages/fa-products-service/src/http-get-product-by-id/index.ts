import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { products } from '../mocks/products';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest,
): Promise<void> {
  context.log('HTTP trigger function processed a request.');

  const productId = Number(req.params.productId);

  if (!productId) {
    context.res = {
      status: 400,
      body: 'Please pass a valid product id',
    };
    return;
  }

  const product = products.find((p) => p.id === productId);

  if (!product) {
    context.res = {
      status: 404,
      body: 'Product not found',
    };
  }

  context.res = {
    body: { product },
  };
};

export default httpTrigger;
