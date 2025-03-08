import express from 'express'
import {UserRegister,LoginUser, userCredits} from '../Controller/UserController.js'
import userAuthorization from '../middlewares/authorization.js';

const userRouter = express.Router()

userRouter.post('/register',UserRegister);
userRouter.post('/login',LoginUser);
userRouter.post('/credits',userAuthorization,userCredits)

export default userRouter;