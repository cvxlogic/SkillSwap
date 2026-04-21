import { Router } from 'express';
import * as reportController from '../controllers/reportController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate, reportSchema } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.post('/', validate(reportSchema), reportController.createReport);

router.get('/', authenticate, authorizeAdmin, reportController.getAllReports);
router.patch('/:id', authenticate, authorizeAdmin, reportController.updateReport);

export default router;