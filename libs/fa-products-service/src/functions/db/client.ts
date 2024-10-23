import { CosmosClient, Database } from '@azure/cosmos';
// import { DefaultAzureCredential } from '@azure/identity';

// const credential = new DefaultAzureCredential();

const DB_URI = process.env['DB_URI'];
const DB_NAME = process.env['DB_NAME'];
const COSMOS_KEY = process.env['COSMOS_KEY'];

const PRODUCT_CONTAINER_NAME = 'products';
const STOCK_CONTAINER_NAME = 'stocks';
class CosmosDbClient {
  private static client: CosmosClient;

  static getClient() {
    if (this.client) {
      return this.client;
    }

    this.client = new CosmosClient({
      endpoint: DB_URI,
      key: COSMOS_KEY,
      // aadCredentials: credential,
    });

    return this.client;
  }
}

export class CosmosDb {
  private static db: Database;

  static getDb() {
    if (this.db) {
      return this.db;
    }

    this.db = CosmosDbClient.getClient().database(DB_NAME);

    return this.db;
  }

  static getProductsContainer() {
    return this.getDb().container(PRODUCT_CONTAINER_NAME);
  }

  static getStocksContainer() {
    return this.getDb().container(STOCK_CONTAINER_NAME);
  }
}
