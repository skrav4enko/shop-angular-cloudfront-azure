import { Product } from '../shared/models/Product';
import { Stock } from '../shared/models/Stock';
import { CosmosDb } from './client';

export type ProductDto = Product & Pick<Stock, 'count'>;

export async function getProducts(): Promise<ProductDto[]> {
  const products = CosmosDb.getProductsContainer()
    .items.readAll<Product>()
    .fetchAll();
  const stocks = CosmosDb.getStocksContainer()
    .items.readAll<Stock>()
    .fetchAll();
  const [productsResult, stocksResult] = await Promise.all([products, stocks]);

  const stockById = stocksResult.resources.reduce<Record<string, number>>(
    (acc, { count, product_id }) => {
      acc[product_id] = count;
      return acc;
    },
    {},
  );

  return productsResult.resources.map(
    ({ title, price, description, id }): ProductDto => {
      return {
        id,
        title,
        price,
        description,
        count: stockById[id] ?? 0,
      };
    },
  );
}

export async function getProductById(id: string): Promise<ProductDto | null> {
  const product = CosmosDb.getProductsContainer().item(id, id).read<Product>();
  const stock = CosmosDb.getStocksContainer().item(id, id).read<Stock>();
  const [productResult, stockResult] = await Promise.all([product, stock]);

  if (!productResult.resource) {
    return null;
  }

  return {
    id: productResult.resource.id,
    title: productResult.resource.title,
    description: productResult.resource.description,
    price: productResult.resource.price,
    count: stockResult.resource.count,
  };
}

export async function createProduct(
  productDto: ProductDto,
): Promise<ProductDto> {
  const product: Product = {
    id: productDto.id,
    title: productDto.title,
    description: productDto.description,
    price: productDto.price,
  };
  const stock: Stock = {
    id: productDto.id,
    product_id: productDto.id,
    count: productDto.count,
  };

  await CosmosDb.getProductsContainer().items.upsert(product);
  await CosmosDb.getStocksContainer().items.upsert(stock);

  return productDto;
}

export async function getProductsTotal(): Promise<number> {
  const query = 'SELECT SUM(c.count) AS totalCount FROM c';
  const result = await CosmosDb.getStocksContainer()
    .items.query<{ totalCount: number }>(query)
    .fetchAll();

  return result.resources[0]?.totalCount;
}
