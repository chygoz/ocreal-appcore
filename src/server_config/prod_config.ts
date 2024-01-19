import dotenv from 'dotenv';
dotenv.config();

export const production = {
  port: process.env.PORT || 3000,
  mongo_uri: process.env.PROD_MONGO_URI,
  node_env: process.env.ENVIRONMENT,
} as const;

type Keys = keyof typeof production;
export type ConfigTypes = (typeof production)[Keys];
