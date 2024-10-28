import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { StorageBlobClientService } from './services/blob.service';

export async function importProductsFileHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const fileName = request.query.get('name');

  if (!fileName) {
    context.warn('No file name provided');

    return {
      status: 400,
      jsonBody: 'Please provide a file name on the query string',
    };
  }

  let blobSasUrl: string;

  try {
    blobSasUrl = StorageBlobClientService.getBlobSasUrl(fileName);
  } catch (error) {
    context.error('Error getting blob SAS URL', error);

    return {
      status: 500,
      jsonBody: 'Error getting blob SAS URL',
    };
  }

  return {
    // status: 200, /* Defaults to 200 */,
    jsonBody: blobSasUrl,
  };
}

app.http('importProductsFileUrl', {
  route: 'import',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: importProductsFileHandler,
});
