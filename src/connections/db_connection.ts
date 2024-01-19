import mongoose from 'mongoose';
import { Database_Error } from '../error_handlers/error_handlers';
import { server_config } from '../server_config/env_config';
import logger from '../logger/logger';

const { mongo_uri } = server_config as any;

export const connect_database = async () => {
  await mongoose
    .connect(mongo_uri!)
    .then(() => logger.info(`Database Connection established 🚀`))
    .catch((e: Error) => {
      throw new Database_Error(e.message);
    });
};
