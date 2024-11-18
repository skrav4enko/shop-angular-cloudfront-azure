import { app, InvocationContext } from '@azure/functions';
import { parse } from 'csv-parse';
import { StorageBlobClientService } from './services/blob.service';
import { SbService } from './services/sb.service';
import { setTimeout } from 'timers/promises';

async function moveBlob(fileName: string): Promise<void> {
  const parsedContainer = StorageBlobClientService.getParsedContainer();
  const uploadedContainer = StorageBlobClientService.getUploadContainer();

  const uploadBlobClient = uploadedContainer.getBlobClient(fileName);
  const parsedBlobClient = parsedContainer.getBlobClient(fileName);

  const blobSasUrl = StorageBlobClientService.getBlobSasUrl(fileName);

  await parsedBlobClient.beginCopyFromURL(blobSasUrl);

  await uploadBlobClient.delete();
}

export async function importProductsFromFileHandler(
  blob: Buffer,
  context: InvocationContext,
): Promise<void> {
  context.log(
    `Storage blob function processed blob file "${context.triggerMetadata.name}" with size ${blob.length} bytes`,
  );

  if (!blob || blob.length === 0) {
    context.warn('No data in the blob');

    return;
  }

  const fileName = context.triggerMetadata.name as string;
  const fileContent = blob.toString('utf8');

  const queueOrTopicName = process.env.SB_PRODUCTS_IMPORT_TOPIC_OR_QUEUE_NAME;

  const sbClient = SbService.getSbClient();
  const sender = SbService.getProductsSender(sbClient, queueOrTopicName);

  try {
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    context.log('Parsing CSV data...');

    let index = -1;
    for await (const record of parser) {
      try {
        context.log('Sending to Service Bus:', queueOrTopicName);
        context.log('Product sending...', record);
        index++;
        await sender.sendMessages({
          body: record,
          applicationProperties: {
            index,
          },
        });
      } catch (error) {
        context.error('Error sending message to Service Bus:', error);
        // throw error; // Re-throw the error to trigger retry mechanism
      }
    }

    context.log('CSV file successfully processed');

    await moveBlob(fileName);

    context.log('Blob moved to parsed container');

    return Promise.resolve();
  } catch (error) {
    context.error('Error processing file:', error);

    return Promise.reject();
    // throw error; // Re-throw the error to trigger retry mechanism
  } finally {
    await setTimeout(3_000);
    await sender.close();
    await sbClient.close();

    context.log('Function execution completed');
  }
}

app.storageBlob('importProductsFromFile', {
  path: 'uploaded/{name}',
  connection: '',
  handler: importProductsFromFileHandler,
});
