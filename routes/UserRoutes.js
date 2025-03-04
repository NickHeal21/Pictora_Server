import express from 'express'
import {UserRegister,LoginUser} from '../Controller/UserController.js'

const userRouter = express.Router()

userRouter.post('/register',UserRegister);
userRouter.post('/login',LoginUser);

export default userRouter;