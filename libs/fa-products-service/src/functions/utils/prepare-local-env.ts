import localSettings from '../../../local.settings.json';

function prepareLocalEnv() {
  const values = localSettings.Values;

  console.log('Setting local environment variables...');

  for (const [key, value] of Object.entries(values)) {
    process.env[key] = value as string;
  }
}

prepareLocalEnv();
