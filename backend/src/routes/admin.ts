import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import * as reportController from '../controllers/reportController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeAdmin);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/suspend', adminController.suspendUser);
router.patch('/users/:id/unsuspend', adminController.unsuspendUser);
router.get('/stats', adminController.getStats);
router.get('/audit-logs', adminController.getAuditLogs);

router.get('/reports', reportController.getAllReports);
router.patch('/reports/:id', reportController.updateReport);

export default router;