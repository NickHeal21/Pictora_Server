import userModel from "../Models/UserModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const UserRegister = async(req,res) => {
    try{
        const {name,email,password} = req.body;
        if(!name){
            return res.json({success:false, message:'Missing Name!'})
        }
        if(!email){
            return res.json({success:false, message:'Missing Email!'})
        }
        if(!password){
            return res.json({success:false, message:'Missing Password!'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password,salt)

        const UserData = {
            name,
            email,
            password:hashedPass
        }

        const newUser = new userModel(UserData)
        const user = await(newUser.save())

        const token = jwt.sign({id: user._id},process.env.JWT_SECRET_KEY)

        res.json({success:true, token,user:{name:user.name}})

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const LoginUser = async(req,res)=>{
    try{
        const {email,password} = req.body
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false, message:'user not exists'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(isMatch){
            const token = jwt.sign({id: user._id},process.env.JWT_SECRET_KEY)
            res.json({success:true,token,user: {name:user.name}})
        }
        else{
            res.json({success:false,message:'Invalid Username or Password!'})
        }
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const userCredits = async(req,res) => {
    try {
        const {userId} = req.body
        const user = await userModel.findById(userId)
        res.json({success: true, credits:user.creditBalance, user: {name:user.name}})
    } 
    catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export {UserRegister,LoginUser, userCredits };
