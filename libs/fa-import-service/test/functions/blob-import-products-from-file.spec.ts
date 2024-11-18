/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { importProductsFromFileHandler } from '../../src/functions/blob-import-products-from-file';
import { StorageBlobClientService } from '../../src/functions/services/blob.service';
import { SbService } from '../../src/functions/services/sb.service';

vi.mock('../../src/functions/services/blob.service', () => ({
  StorageBlobClientService: {
    getParsedContainer: vi.fn().mockReturnValue({
      getBlobClient: vi.fn().mockReturnValue({
        beginCopyFromURL: vi.fn().mockResolvedValue({}),
      }),
    }),
    getUploadContainer: vi.fn().mockReturnValue({
      getBlobClient: vi.fn().mockReturnValue({
        delete: vi.fn().mockResolvedValue({}),
      }),
    }),
    getBlobSasUrl: vi
      .fn()
      .mockReturnValue(
        'https://mock-storage-account.blob.core.windows.net/mock-container/mock-blob.csv?sv=mock-sas-token',
      ),
  },
}));

vi.mock('../../src/functions/services/sb.service', () => ({
  SbService: {
    getSbClient: vi.fn().mockReturnValue({
      close: vi.fn().mockReturnValue({}),
    }),
    getProductsSender: vi.fn().mockReturnValue({
      close: vi.fn().mockReturnValue({}),
      sendMessages: vi.fn().mockReturnValue({}),
    }),
  },
}));

describe('importProductsFromFileHandler', () => {
  const contextMock = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    triggerMetadata: {
      name: 'test-products.csv',
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log a message and return early if the blob is empty', async () => {
    const blob = Buffer.from('');

    await importProductsFromFileHandler(blob, contextMock);

    expect(contextMock.warn).toHaveBeenCalledWith('No data in the blob');
  });

  it('should parse the CSV data, log each product, and move the blob', async () => {
    const blob = Buffer.from(
      'productId,productName,productPrice\n1,Product A,10.99\n2,Product B,19.99',
    );

    await importProductsFromFileHandler(blob, contextMock);

    expect(contextMock.log).toHaveBeenCalledWith(
      'Storage blob function processed blob file "test-products.csv" with size 70 bytes',
    );

    expect(contextMock.log).toHaveBeenCalledWith('Parsing CSV data...');

    expect(contextMock.log).toHaveBeenCalledWith(
      'CSV file successfully processed',
    );

    expect(contextMock.log).toHaveBeenCalledWith(
      'Blob moved to parsed container',
    );

    expect(
      StorageBlobClientService.getParsedContainer().getBlobClient,
    ).toHaveBeenCalledWith('test-products.csv');

    expect(
      StorageBlobClientService.getUploadContainer().getBlobClient,
    ).toHaveBeenCalledWith('test-products.csv');
  });
});
