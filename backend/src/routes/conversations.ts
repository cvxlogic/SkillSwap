import { Router } from 'express';
import * as conversationController from '../controllers/conversationController';
import { authenticate } from '../middleware/auth';
import { validate, messageSchema } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.get('/', conversationController.getConversations);
router.get('/unread-count', conversationController.getUnreadCount);
router.get('/:id', conversationController.getConversationById);
router.post('/:id/messages', validate(messageSchema), conversationController.sendMessage);
router.patch('/:id/read', conversationController.markAsRead);

export default router;