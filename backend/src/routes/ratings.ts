import { Router } from 'express';
import * as ratingController from '../controllers/ratingController';
import { authenticate } from '../middleware/auth';
import { validate, ratingSchema } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.post('/', validate(ratingSchema), ratingController.createRating);
router.get('/my-given', ratingController.getMyGivenRatings);
router.get('/user/:id', ratingController.getUserRatings);

export default router;