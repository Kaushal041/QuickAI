import express from 'express';
import { auth } from '../middleware/auth.js';
import { getUserCreations, getPublishedCreations, getUserPlan, toggleLikeCreation } from '../controllers/userController.js';

const userRouter=express.Router();

userRouter.get('/get-user-plan',auth, getUserPlan);
userRouter.get('/get-user-creations',auth, getUserCreations);
userRouter.get('/get-published-creations',auth, getPublishedCreations);
userRouter.post('/toggle-like-creation',auth, toggleLikeCreation);

export default userRouter;