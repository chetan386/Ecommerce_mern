const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");

// Register User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is a simple id",
      url: "profilepicUrl",
    },
  });
  sendToken(user, 201, res);
});

//Login User

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  //checking if user has given password and email both
  if (!email || !password) {
    return next(new ErrorHandler(400, "Please enter Email & Password"));
  }
  //select because we has select false to pass in userSchema
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler(401, "invalid email or password"));
  }
  //to check password match or not
  const isPasswordMatched = await user.comparePassword(password); //we make this method in userSchema

  if (!isPasswordMatched) {
    return next(new ErrorHandler(401, "invalid email or password"));
  }

  //if matched
  sendToken(user, 200, res);
});

//Logout user

exports.logout = catchAsyncErrors(async (req, res, next) => {
  //  do opposite of isAuth
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//Forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler(404, "User not found"));
  }
  //Get resetPasswordToken
  const resetToken = user.getResetPasswordToken();

  user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If u have not not request this email then please ignore it `;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message: message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(500, error.message));
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  //creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        404,
        "Reset Password Token is invalid or has been expired"
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler(404, "Password does not match"));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  sendToken(user, 200, res);
});


//get user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//update password

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler(400, "Old password is incorrect"));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler(400, "Password does not match"));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

//update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }
    //we will add cloudinary later 

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators: true,
        useFindAndModify: false,
    });
     
    res.status(200).json({
        success:true,
    })
  });

  //get all users(admin)
exports.getAllUsers = catchAsyncErrors(async(req, res, next)=>{
    const users = await User.find();
 
    res.status(200).json({
     success: true,
     users
    })

})

//get single users(admin)
exports.getSingleUser = catchAsyncErrors(async(req, res, next)=>{
    
 const user = await User.findById(req.params.id);

 if(!user){
     return next(new ErrorHandler(400,`User does not exist with Id: ${req.params.id}`));
 }

 res.status(200).json({
  success: true,
  user
 })

})

//update user Role
exports.updateRole = catchAsyncErrors(async (req, res, next) => {
    
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    //we will add cloudinary later 

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators: true,
        useFindAndModify: false,
    });


    if(!user){
        return next(new ErrorHandler(400,`User does not exist with Id: ${req.params.id}`))
    }
     
    res.status(200).json({
        success:true,
    })
  });


//delete user --ADMIN
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    
    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler(400,`User does not exist with Id: ${req.params.id}`))
    }
    
  //we will remove cloudnary
  
  await user.deleteOne();
     
    res.status(200).json({
        success:true,
        message: "User deleted successfully"
    })
  });
