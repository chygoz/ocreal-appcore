import { Application } from 'express';
import { users_auth_routes } from '../routes/user_routes/auth_route';

export const setup_routes = (app: Application) => {
  // Root Route

  app.get('/', (req, res) => {
    console.log(req.query, 'query');
    res.send('Hi there!');
  });

  app.get('/test', (req, res) => {
    res.send(req.ip);
  });

  // Users API Routes

  app.use('/api/v1/user/auth', users_auth_routes);

  // Buyer routes
  // app.use('/api/v1/buyer', );

  // Seller API Routes

  // app.use('/api/v1/seller/auth', );

  //Agent routes
  // app.use('/api/v1/agent/auth', );

  //Public routes
  // app.use('/api/v1/website', websiteRoutes);

  //Webhooks
  // app.use('/api/v1/webhook', webHookRouter);
};
