import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';

export class SbService {
  private static client: ServiceBusClient;
  private static sender: ServiceBusSender;

  static getSbClient() {
    if (!SbService.client) {
      const connectionString = process.env.SB_CONNECTION_STRING;
      if (!connectionString) {
        throw new Error('SB_CONNECTION_STRING is not defined');
      }

      SbService.client = new ServiceBusClient(connectionString);
    }

    return SbService.client;
  }

  static getProductsSender() {
    if (!SbService.sender) {
      const queueName = process.env.SB_PRODUCTS_IMPORT_QUEUE_NAME;

      if (!queueName) {
        throw new Error('SB_PRODUCTS_IMPORT_QUEUE_NAME is not defined');
      }

      SbService.sender = SbService.getSbClient().createSender(queueName);
    }

    return SbService.sender;
  }
}
