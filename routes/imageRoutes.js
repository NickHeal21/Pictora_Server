import express from 'express'
import { generateImg } from '../Controller/imageController.js'
import userAuthorization from '../middlewares/authorization.js'

const imgRouter = express.Router()

imgRouter.post('/generate-image',userAuthorization, generateImg)

export default imgRouter