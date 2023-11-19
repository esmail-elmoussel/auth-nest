import { AppConfig } from 'src/types/global.types';

export const validateEnvVariables = (config: AppConfig) => {
  if (!config.NODE_ENV) {
    throw new Error('"NODE_ENV" is not defined!');
  }

  if (!config.PORT) {
    throw new Error('"PORT" is not defined!');
  }

  if (process.env.NODE_ENV !== 'test' && !config.DATABASE_URL) {
    throw new Error('"DATABASE_URL" is not defined!');
  }

  if (!config.JWT_SECRET) {
    throw new Error('"JWT_SECRET" is not defined!');
  }

  return config as AppConfig;
};
