import { Router } from 'express';
import { Auth_Controller } from '../../controllers/auth_controller';
import async_handler from '../../response_handler/async_handler';
const router = Router();
const authController = new Auth_Controller();

router.post('/sign_up', async_handler(authController.create_user_account));

// router.post('/login', async_handler(authController.loginLDB));

export { router as users_auth_routes };
