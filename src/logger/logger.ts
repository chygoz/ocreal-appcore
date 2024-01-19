// logger.ts
import winston from 'winston';
import { server_config } from '../server_config/env_config';

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${level.toUpperCase()}]: ${message} [${timestamp}] `;
});

const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${level}: ${message} ${timestamp}`;
  }),
);

const logger = winston.createLogger({
  level: server_config.node_env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(customFormat, logFormat),
  transports: [
    // new winston.transports.File({ filename: 'combined.log' }),
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),

    new winston.transports.Console(),
  ],
});

export default logger;
