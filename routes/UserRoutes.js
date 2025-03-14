import express from 'express'
import {UserRegister,LoginUser, userCredits, paymentRazorpay, verifyPayment} from '../Controller/UserController.js'
import userAuthorization from '../middlewares/authorization.js';

const userRouter = express.Router()

userRouter.post('/register',UserRegister);
userRouter.post('/login',LoginUser);
userRouter.get('/credits',userAuthorization,userCredits)
userRouter.post('/payment',userAuthorization,paymentRazorpay)
userRouter.post('/verify-pay',verifyPayment)

export default userRouter;