import dotenv from 'dotenv';
dotenv.config();

export const development = {
  port: process.env.PORT || 3000,
  mongo_uri: process.env.DEV_MONGO_URI,
  node_env: process.env.ENVIRONMENT,
} as const;

type Keys = keyof typeof development;
export type ConfigTypes = (typeof development)[Keys];
