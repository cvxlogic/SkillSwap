import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { upload, handleUploadError } from '../middleware/upload';

const router = Router();

router.get('/search', userController.searchUsers);
router.get('/recommendations', authenticate, userController.getRecommendedTeachers);
router.get('/:id', userController.getUserById);
router.post('/avatar', authenticate, upload.single('avatar'), handleUploadError, userController.uploadAvatar);

export default router;