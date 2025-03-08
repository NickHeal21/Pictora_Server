import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import userRouter from './routes/UserRoutes.js'
import imgRouter from './routes/imageRoutes.js'


const PORT = process.env.PORT || 4000
const app = express()

app.use(express.json())
app.use(cors())
await connectDB()

app.use('/api/user',userRouter)
app.use('/api/image',imgRouter)
app.get('/',(req,res)=> res.send("api is working"))

app.listen(PORT,()=> console.log("Server Running on port no:"+PORT))
