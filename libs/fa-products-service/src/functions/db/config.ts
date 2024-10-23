import { AppConfigurationClient } from '@azure/app-configuration';

const connection_string = process.env.AZURE_APP_CONFIG_CONNECTION_STRING;

export class ConfigurationClient {
  private static client: AppConfigurationClient;

  static getConfigClient() {
    if (this.client) {
      return this.client;
    }

    this.client = new AppConfigurationClient(connection_string);

    return this.client;
  }

  static async getConfigurationSetting(key: string) {
    return this.client.getConfigurationSetting({ key });
  }
}
