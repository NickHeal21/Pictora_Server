import userModel from "../Models/UserModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Razorpay from 'razorpay'
import transactionModel from "../Models/transactionModel.js";

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
        const hashedPass = await bcrypt.hash(password.trim(),salt)

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
        console.log("Received Login Request: ", { email, password });

        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false, message:'User does not exists'})
        }

        console.log("Stored Password Hash: ", user.password);

        if (!password || !user.password) {
            return res.json({success:false, message:'Password is missing!'});
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

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, 
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const paymentRazorpay = async(req,res) => {
    try {
        const {userId,planId} = req.body
        console.log(typeof razorpayInstance.orders.create);
        const userData = await userModel.findById(userId)
        if(!userData || !planId){
            return res.json({success:false, message:'Missing Details'})
        }

        let credits,plan,amt,date

        switch(planId){
            case 'Basic':
                plan = 'Basic'
                credits = 100
                amt = 10
            break;

            case 'Advanced':
                plan = 'Advanced'
                credits = 500
                amt = 50
            break;

            case 'Business':
                plan = 'Business'
                credits = 5000
                amt = 250
            break;

            default:
                return res.json({success:false, message:'Plan not found'})
        }

        date = Date.now();

        const transactionData = {
            userId,plan,amt,credits,date
        }

        const newTransaction = await transactionModel.create(transactionData)

        const options = {
            amount: amt*100,
            currency : process.env.CURRENCY,
            receipt : newTransaction._id,
        }

        try {
            const order = await razorpayInstance.orders.create(options);
            console.log("Order created:", order);
            res.json({ success: true, order });
        } catch (error) {
            console.error(error);
            res.json({ success: false, message: error.message });
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message:error.message})
    }
}


const verifyPayment = async (req,res) => {
    try {
        
        const {razorpay_order_id} = req.body

        if (!razorpay_order_id) {
            return res.json({ success: false, message: "Order ID is missing from request" });
        }
        
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if(orderInfo.status === 'paid'){
            const transactionData = await transactionModel.findById(orderInfo.receipt)

            if(transactionData.payment){
                return res.json({success:false,message:'Payment Failed'})
            }
            const userData = await userModel.findById(transactionData.userId)

            const creditBalance = userData.creditBalance + transactionData.credits

            await userModel.findByIdAndUpdate(userData._id, {creditBalance})

            await transactionModel.findByIdAndUpdate(transactionData._id, {payment:true})

            res.json({success:true,message:'credits added'})
        }
        else{
            res.json({success:false,message:'Payment Failed!'})
        }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export {UserRegister,LoginUser, userCredits, paymentRazorpay,verifyPayment };
