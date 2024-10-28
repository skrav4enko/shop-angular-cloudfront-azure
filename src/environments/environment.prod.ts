import { Config } from './config.interface';

export const environment: Config = {
  production: true,
  apiEndpoints: {
    product: 'https://fa-product-services-ne-001.azurewebsites.net/api',
    order: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
    import: 'https://fa-import-service-ne-001.azurewebsites.net/api',
    bff: 'https://fa-product-services-ne-001.azurewebsites.net/api',
    cart: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
  },
  apiEndpointsEnabled: {
    product: true,
    order: false,
    import: true,
    bff: true,
    cart: false,
  },
};
