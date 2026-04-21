import { Router } from 'express';
import * as skillController from '../controllers/skillController';
import { authenticate } from '../middleware/auth';
import { validate, skillSchema, userSkillSchema, updateUserSkillSchema } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.get('/', skillController.getSkills);
router.get('/categories', skillController.getCategories);
router.get('/my', skillController.getMySkills);
router.get('/users/:skillId', skillController.getUsersBySkill);
router.post('/', validate(skillSchema), skillController.createSkill);
router.post('/my', validate(userSkillSchema), skillController.addMySkill);
router.patch('/my/:skillId', validate(updateUserSkillSchema), skillController.updateMySkill);
router.delete('/my/:skillId', skillController.removeMySkill);

export default router;