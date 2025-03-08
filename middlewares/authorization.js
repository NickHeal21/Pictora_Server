import jwt from 'jsonwebtoken'


const userAuthorization = async(req,res,next) => {
    const {token} = req.headers;

    if(!token){
        return res.json({success: false, message:'Not Authorized, Login Again!'})
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET_KEY)

        if(tokenDecode.id){
            req.body.userId = tokenDecode.id
        }
        else{
            return res.json({success: false, message:'Not Authorized, Login again!'})
        }

        next()

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


export default userAuthorization