const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User =  require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");

exports.isAuthenticated = catchAsyncErrors(async(req,res,next)=>{

    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler(400,"Please login to access this resource"))
    }
//secret key se token ko decrypt karke verify user
    const decodedData = jwt.verify(token,process.env.JWT_SECRET)
// req.user mai user ko store karle lege ye jab tak login rehega toh hum req mai se user ka data access kar sakte hai
    req.user = await User.findById(decodedData._id)
     next();

})

exports.authorizeRoles =(...roles)=>{
       return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
       return next(new ErrorHandler(403,`Role: ${req.user.role} is not authorized to access this resource`))
        }
        

       next();
    }
}



