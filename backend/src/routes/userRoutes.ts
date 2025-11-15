import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.post('/change-password', UserController.changePassword);
router.delete('/account', UserController.deleteAccount);
router.get('/audit-logs', UserController.getAuditLogs);
router.put('/consent', UserController.updateConsent);

export default router;

