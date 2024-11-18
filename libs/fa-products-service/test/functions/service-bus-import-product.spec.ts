/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { serviceBusQueueHandler } from '../../src/functions/service-bus-import-product';
import { createProduct } from '../../src/functions/db/products-db';
import { validateProductStock } from '../../src/functions/shared/models/Product';

vi.mock('../../src/functions/db/products-db');
vi.mock('../../src/functions/shared/models/Product');

describe('serviceBusQueueHandler', () => {
  const context = {
    log: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    triggerMetadata: {
      messageId: 'test-message-id',
    },
  } as any;

  it('should log and reject if message is invalid', async () => {
    const invalidMessage = null;

    await expect(
      serviceBusQueueHandler(invalidMessage, context),
    ).rejects.toBeUndefined();

    expect(context.error).toHaveBeenCalledWith(
      'Invalid message',
      invalidMessage,
    );
  });

  it('should create a new product and log success', async () => {
    const validMessage = {
      price: 100,
      title: 'Test Product',
      description: 'Test Description',
      count: 10,
    };

    (validateProductStock as any).mockReturnValue(validMessage);
    (createProduct as any).mockResolvedValue(undefined);

    await serviceBusQueueHandler(validMessage, context);

    expect(validateProductStock).toHaveBeenCalledWith(validMessage);
    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining(validMessage),
    );

    expect(context.info).toHaveBeenCalledWith(
      expect.stringContaining('Created product and stock entity with'),
    );
  });

  it('should log and reject if there is an error creating the product', async () => {
    const validMessage = {
      price: 100,
      title: 'Test Product',
      description: 'Test Description',
      count: 10,
    };

    (validateProductStock as any).mockReturnValue(validMessage);
    (createProduct as any).mockRejectedValue(new Error('Test Error'));

    await expect(
      serviceBusQueueHandler(validMessage, context),
    ).rejects.toBeUndefined();

    expect(context.error).toHaveBeenCalledWith(
      'Error creating product',
      expect.any(Error),
    );
  });
});
