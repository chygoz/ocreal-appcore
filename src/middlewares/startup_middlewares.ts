import cors from 'cors';
import bodyParser from 'body-parser';
import { Application } from 'express';
import { register_request_logger } from '../logger/request_logger';
import { server_config } from '../server_config/env_config';
const allowedDomains = ['http://http://localhost:3000/'];

const corsOptions = {
  credentials: true,
  origin: true,
  optionsSuccessStatus: 200,
};

export const add_middlewares = (app: Application) => {
  register_request_logger(app);
  app.use(
    cors({
      credentials: true,
      optionsSuccessStatus: 200,
      origin: function (origin, callback) {
        console.log(origin);
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        console.log(origin);
        if (
          allowedDomains.indexOf(origin) === -1 &&
          server_config.node_env === 'production'
        ) {
          const msg =
            'The CORS policy for this site does not ' +
            'allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }

        return callback(null, true);
      },
    }),
  );

  app.use(
    bodyParser.urlencoded({
      limit: '5mb',
      extended: true,
    }),
  );
  app.use('/api', bodyParser.json());
};
