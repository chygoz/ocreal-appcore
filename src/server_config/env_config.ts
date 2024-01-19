/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

import { development } from './dev_config';
import { production } from './prod_config';

export let server_config: any = {};
const config = {};

const environment = process.env.NODE_ENV;

if (environment === 'development') {
  server_config = { ...config, ...development };
} else if (environment === 'production') {
  server_config = { ...config, ...production };
}
