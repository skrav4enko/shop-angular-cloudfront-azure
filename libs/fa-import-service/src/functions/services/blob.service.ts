import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';

const AZURE_STORAGE_ACCOUNT_NAME = process.env['AZURE_STORAGE_ACCOUNT_NAME'];
const AZURE_STORAGE_KEY = process.env['AZURE_STORAGE_KEY'];

const UPLOADED_CONTAINER_NAME = 'uploaded';
const PARSED_CONTAINER_NAME = 'parsed';

export class StorageBlobClientService {
  private static client: BlobServiceClient;

  static getClient() {
    if (this.client) {
      return this.client;
    }

    if (!AZURE_STORAGE_ACCOUNT_NAME || !AZURE_STORAGE_KEY) {
      throw Error(
        'AZURE_STORAGE_ACCOUNT_NAME or AZURE_STORAGE_KEY not provided',
      );
    }

    this.client = new BlobServiceClient(
      `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      StorageBlobClientService.getSharedKeyCredential(),
    );

    return this.client;
  }

  static getUploadContainer() {
    return StorageBlobClientService.getClient().getContainerClient(
      UPLOADED_CONTAINER_NAME,
    );
  }

  static getParsedContainer() {
    return StorageBlobClientService.getClient().getContainerClient(
      PARSED_CONTAINER_NAME,
    );
  }

  static getBlobSasUrl(blobName: string) {
    const containerName = UPLOADED_CONTAINER_NAME;

    const containerClient = StorageBlobClientService.getUploadContainer();
    const blobClient = containerClient.getBlobClient(blobName);
    const expiresOn = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const permissions = BlobSASPermissions.parse('racwd'); // read, add, create, write, delete

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions,
        expiresOn,
      },
      StorageBlobClientService.getSharedKeyCredential(),
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  }

  private static getSharedKeyCredential() {
    return new StorageSharedKeyCredential(
      AZURE_STORAGE_ACCOUNT_NAME,
      AZURE_STORAGE_KEY,
    );
  }
}
