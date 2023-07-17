const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");



//create product -- Admin Route
exports.createProduct = catchAsyncErrors(async(req,res,next)=>{

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })

})

//get all products
exports.getAllProducts = catchAsyncErrors(async(req,res)=>{

    const resultPerPage = 5
    const productCount = await Product.countDocuments()
    const apiFeature = new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage)
    const products = await apiFeature.query;
    res.status(200).json({
        success: true,
        products,
        productCount
    })
})

//update product -- Admin route
exports.updateProduct = catchAsyncErrors(async(req,res,next)=>{
    let product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler(404,"Product not found"));
    }

        product = await Product.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators: true,
            useFindAndModify: false,
        }) 

        res.status(200).json({
            success:true,
            product
        })
    
})

//delete product 
exports.deleteProduct= catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
 
    if(!product){
     return next(new ErrorHandler(404,"Product not found"));
 }
 
    await product.deleteOne()
 
    res.status(200).json({
     success: false,
     message: "product deleted successfully"
    })
 }
 )

//get product details  
exports.getProductDetails = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler(404,"Product not found"));
    }
    
    res.status(200).json({
        success: true,
        product
    })
})
