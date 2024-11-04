import { app, InvocationContext } from '@azure/functions';
import { parse } from 'csv-parse';
import { StorageBlobClientService } from './services/blob.service';

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

  try {
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    context.log('Parsing CSV data...');

    for await (const record of parser) {
      context.log('Product', record);
    }

    context.log('CSV file successfully processed');

    await moveBlob(fileName);

    context.log('Blob moved to parsed container');

    return;
  } catch (error) {
    context.error('Error processing file:', error);
    throw error; // Re-throw the error to trigger retry mechanism
  }
}

app.storageBlob('importProductsFromFile', {
  path: 'uploaded/{name}',
  connection: '',
  handler: importProductsFromFileHandler,
});
