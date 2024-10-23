import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { randomUUID } from 'crypto';
import { createProduct, ProductDto } from './db/products-db';

export async function createProductHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const body: Partial<ProductDto> = await request.json();
  context.info(`Http function processed POST request with data: `, body);

  if (!body.title || !body.price || !body.description || !body.count) {
    return {
      status: 400,
      body: 'Please pass title, price, description and count in the request body',
    };
  }

  const id = randomUUID();
  const newProduct: ProductDto = {
    id,
    price: body.price,
    title: body.title,
    description: body.description,
    count: body.count,
  };

  const createdProduct = await createProduct(newProduct);

  context.info(`Created product and stock entity with ${id}`);

  return {
    status: 201,
    jsonBody: {
      ...createdProduct,
    },
  };
}

app.http('createProduct', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'products',
  handler: createProductHandler,
});
