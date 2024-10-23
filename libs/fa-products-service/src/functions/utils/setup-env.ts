import localSettings from '../../../local.settings.json';

function setupEnv() {
  const values = localSettings.Values;

  console.log('Setting local environment variables...');

  for (const [key, value] of Object.entries(values)) {
    console.log(`Variable: ${key}, Value: ${value}`);
    process.env[key] = value as string;
  }
}

setupEnv();
