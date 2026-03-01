import express, { Router } from 'express';
import auth, { UserRole } from '../../middlewares/auth';
import { tutorProfileController } from './tutorProfile.controller';



const router = express.Router();

router.post('/', auth(UserRole.TUTOR), tutorProfileController.createTutorProfile)

export const tutorProfileRouter = router;