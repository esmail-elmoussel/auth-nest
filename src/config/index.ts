import { AppConfig } from 'src/types/global.types';

export const validateEnvVariables = (config: AppConfig) => {
  if (!config.PORT) {
    throw new Error('"PORT" is not defined!');
  }

  if (!config.DATABASE_HOST) {
    throw new Error('"DATABASE_HOST" is not defined!');
  }

  if (!config.DATABASE_PORT) {
    throw new Error('"DATABASE_PORT" is not defined!');
  }

  if (!config.DATABASE_NAME) {
    throw new Error('"DATABASE_NAME" is not defined!');
  }

  if (!config.JWT_SECRET) {
    throw new Error('"JWT_SECRET" is not defined!');
  }

  return config as AppConfig;
};
