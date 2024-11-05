import { app, InvocationContext } from '@azure/functions';
import { createProduct, ProductDto } from './db/products-db';
import { randomUUID } from 'crypto';
import { validateProductStock } from './shared/models/Product';

export async function serviceBusQueueHandler(
  message: unknown,
  context: InvocationContext,
): Promise<void> {
  context.log('Service bus queue function processed message:', message);
  context.log('MessageId =', context.triggerMetadata.messageId);

  // check if message is valid
  if (!message || typeof message !== 'object') {
    context.error('Invalid message', message);

    return;
  }

  try {
    const id = randomUUID();
    const productStock = validateProductStock(message);

    const newProduct: ProductDto = {
      id,
      price: productStock.price,
      title: productStock.title,
      description: productStock.description,
      count: productStock.count,
    };

    await createProduct(newProduct);

    context.info(`Created product and stock entity with ${id}`);
  } catch (error) {
    context.error('Error creating product', error);
  }
}

app.serviceBusQueue('serviceBusImportProduct', {
  connection: 'SB_CONNECTION_STRING',
  queueName: process.env.SB_PRODUCTS_IMPORT_TOPIC_OR_QUEUE,
  handler: serviceBusQueueHandler,
});

// app.serviceBusTopic('serviceBusImportProduct', {
//   connection: 'SB_CONNECTION_STRING',
//   topicName: process.env.SB_PRODUCTS_IMPORT_TOPIC_OR_QUEUE,
//   subscriptionName: 'sb_product_subscription',
//   handler: serviceBusQueueHandler,
// });

// app.serviceBusTopic('serviceBusImportProductStock', {
//   connection: 'SB_CONNECTION_STRING',
//   topicName: process.env.SB_PRODUCTS_IMPORT_TOPIC_OR_QUEUE,
//   subscriptionName: 'sb_stock_subscription',
//   handler: serviceBusQueueHandler,
// });
