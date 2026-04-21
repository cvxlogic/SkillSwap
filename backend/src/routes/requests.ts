import { Router } from 'express';
import * as requestController from '../controllers/requestController';
import { authenticate } from '../middleware/auth';
import { validate, requestSchema } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.post('/', validate(requestSchema), requestController.createRequest);
router.get('/incoming', requestController.getIncomingRequests);
router.get('/outgoing', requestController.getOutgoingRequests);
router.get('/:id', requestController.getRequestById);
router.patch('/:id/accept', requestController.acceptRequest);
router.patch('/:id/reject', requestController.rejectRequest);
router.patch('/:id/cancel', requestController.cancelRequest);

export default router;