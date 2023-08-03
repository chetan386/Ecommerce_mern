const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//create new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
  } = req.body;


 const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo:{
      ...paymentInfo,
      paidAt: Date.now(),
    },
    user: req.user._id
 })
  
 res.status(201).json({
    success: true,
    order
 })
});


//GET SINGLE ORDER --ADMIN--
exports.getSingleOrder = catchAsyncErrors(async(req,res,next)=>{
      const order = await Order.findById(req.params.id).populate("user","name email");

      if(!order){
         return next(new ErrorHandler(404,"Oder not found with this id"));
      }

      res.status(200).json({
         success:true,
         order
      })
})


//GET LOGGED IN USER ORDERS
exports.myOrders = catchAsyncErrors(async(req,res,next)=>{
   const orders = await Order.find({user: req.user._id})

   res.status(200).json({
      success:true,
      orders
   })
})


//get All orders --Admin
exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{
      const orders = await Order.find();

      let totalAmount =0;

      orders.forEach((order)=>{
         totalAmount+=order.paymentInfo.totalPrice;
      })
      console.log(totalAmount)
      res.status(200).json({
         success: true,
         totalAmount,
         orders
      })
})


//UPADATE ORDER STATUS --ADMIN show admin in dashboard
exports.updateOrder = catchAsyncErrors(async(req,res,next)=>{
   const order = await Order.findById(req.params.id)
   if(!order){
      return next(new ErrorHandler(404,"Order not found with this id"));
   }

   if(order.orderStatus === "Delivered"){
      return next(new ErrorHandler(400,"You have already delivered this order"))
   }

   order.orderItems.forEach(async (o)=>{
       await updateStock(o.product,o.quantity)
   })

   order.orderStatus = req.body.status;
   if(req.body.status === "Delivered"){
   order.deliveredAt = Date.now();
   }

   await order.save({validateBeforeSave: false})

   res.status(200).json({
      success:true
   })
})


async function updateStock(id,quantity){
  const product = await Product.findById(id);

  product.stock = product.stock - quantity;
 await  product.save({validateBeforeSave: false});
}


//delete order
exports.deleteOrders = catchAsyncErrors(async(req,res,next)=>{
   const order = await Order.findById(req.params.id)
   if(!order){
      return next(new ErrorHandler(404,"Order not found with this id"));
   }

  await order.deleteOne();

   res.status(200).json({
      success:true
   })
})