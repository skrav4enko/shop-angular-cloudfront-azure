import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';

export class SbService {
  static getSbClient(): ServiceBusClient {
    const connectionString = process.env.SB_CONNECTION_STRING;

    if (!connectionString) {
      throw new Error('SB_CONNECTION_STRING is not defined');
    }

    return new ServiceBusClient(connectionString);
  }

  static getProductsSender(
    client: ServiceBusClient,
    queueOrTopicName: string,
  ): ServiceBusSender {
    if (!queueOrTopicName) {
      throw new Error('SB_PRODUCTS_IMPORT_TOPIC_OR_QUEUE_NAME is not defined');
    }

    return client.createSender(queueOrTopicName);
  }
}
