import { app, InvocationContext } from '@azure/functions';
import { parse } from 'csv-parse';
import { StorageBlobClientService } from './services/blob.service';

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

  const parser = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  let resolve;
  let reject;

  const done = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  parser.on('readable', () => {
    let record;

    context.log('Parsing CSV data...');

    while ((record = parser.read()) !== null) {
      context.log('Product', record);
    }
  });

  parser.on('error', (error) => {
    context.error('Error processing blob file', error);
    reject();
  });

  parser.on('end', async () => {
    context.log('CSV file successfully processed');

    const parsedContainer = StorageBlobClientService.getParsedContainer();
    const uploadedContainer = StorageBlobClientService.getUploadContainer();

    const uploadedBlob = uploadedContainer.getBlobClient(fileName);
    const parsedBlob = parsedContainer.getBlobClient(fileName);

    const blobSasUrl = StorageBlobClientService.getBlobSasUrl(fileName);

    try {
      await parsedBlob.beginCopyFromURL(blobSasUrl);
      await uploadedBlob.delete();

      context.log('Blob file moved to parsed container');
      resolve();
    } catch (error) {
      context.error('Error moving blob file', error);
      reject();
    }
  });

  return await done;
}

app.storageBlob('importProductsFromFile', {
  path: 'uploaded/{name}',
  connection: '',
  handler: importProductsFromFileHandler,
});
