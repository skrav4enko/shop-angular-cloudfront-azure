import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { products } from '../mocks/products';

const httpTrigger: AzureFunction = async function (
  context: Context,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  req: HttpRequest,
): Promise<void> {
  context.log('HTTP trigger function processed a request.');

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: products,
  };
};

export default httpTrigger;
