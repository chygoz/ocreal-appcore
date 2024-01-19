import express from 'express';
import {
  Not_Found_Error_Handler,
  Server_Error_Handler,
} from './error_handlers/error_handlers';
import dotenv from 'dotenv';
import { connect_database } from './connections/db_connection';
import logger from './logger/logger';
import { add_middlewares } from './middlewares/startup_middlewares';
import { setup_routes } from './middlewares/routes_setup_middleware';

dotenv.config();

const app = express();

// Add Middlewares
add_middlewares(app);

// Setup Routes
setup_routes(app);

// Handle Errors
app.use(Not_Found_Error_Handler);
app.use(Server_Error_Handler);

setTimeout(() => {
  connect_database();
}, 2000);

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`[server]: Server is running on Port: ${PORT}⚡️🤖`);
});

process.on('uncaughtException', function (err) {
  logger.error(err);
  logger.error(err.stack);
});
