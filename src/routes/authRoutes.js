import express from 'express';
import { loginEstudiante } from '../controllers/authController.js';

const router = express.Router();

router.post('/estudiantes/login', loginEstudiante);

export default router; 