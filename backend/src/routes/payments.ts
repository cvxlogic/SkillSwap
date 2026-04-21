import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { validate, paymentSchema, paymentVerifySchema } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.post('/create-order', validate(paymentSchema), paymentController.createOrder);
router.post('/verify', validate(paymentVerifySchema), paymentController.verifyPayment);
router.get('/my', paymentController.getMyPayments);
router.post('/:paymentId/refund', paymentController.requestRefund);

export default router;