/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { StorageBlobClientService } from '../../src/functions/services/blob.service';
import { importProductsFileHandler } from '../../src/functions/http-get-import-products-file';
import { HttpRequest, InvocationContext } from '@azure/functions';

vi.mock('../../src/functions/services/blob.service', () => ({
  StorageBlobClientService: {
    getBlobSasUrl: vi.fn(),
  },
}));

describe('importProductsFileHandler', () => {
  it('should return 400 if no file name provided', async () => {
    const mockRequest: HttpRequest = {
      url: 'http://example.com/import',
      query: {
        get: vi.fn().mockReturnValue(undefined),
      },
    } as any;
    const mockContext: InvocationContext = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as any;

    const response = await importProductsFileHandler(mockRequest, mockContext);

    expect(response.status).toBe(400);
    expect(response.jsonBody).toBe(
      'Please provide a file name on the query string',
    );

    expect(mockContext.warn).toHaveBeenCalled();
  });

  it('should return 500 if there is an error getting the blob SAS URL', async () => {
    const mockRequest: HttpRequest = {
      url: 'http://example.com/import',
      query: {
        get: vi.fn().mockReturnValue('testfile.csv'),
      },
    } as any;
    const mockContext: InvocationContext = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as any;
    (StorageBlobClientService.getBlobSasUrl as any).mockImplementation(() => {
      throw new Error('Failed to get SAS URL');
    });

    const response = await importProductsFileHandler(mockRequest, mockContext);

    expect(response.status).toBe(500);
    expect(response.jsonBody).toBe('Error getting blob SAS URL');
    expect(mockContext.error).toHaveBeenCalled();
  });

  it('should return 200 and the blob SAS URL if everything is correct', async () => {
    const mockRequest: HttpRequest = {
      url: 'http://example.com/import',
      query: {
        get: vi.fn().mockReturnValue('testfile.csv'),
      },
    } as any;
    const mockContext: InvocationContext = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as any;
    const expectedSasUrl = 'http://blobstorage.com/sasurl';
    (StorageBlobClientService.getBlobSasUrl as any).mockReturnValue(
      expectedSasUrl,
    );

    const response = await importProductsFileHandler(mockRequest, mockContext);

    expect(response.jsonBody).toBe(expectedSasUrl);
    expect(mockContext.log).toHaveBeenCalled();
  });
});
