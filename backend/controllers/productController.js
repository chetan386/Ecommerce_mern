const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");



//create product -- Admin Route
exports.createProduct = catchAsyncErrors(async(req,res,next)=>{
    req.body.user = req.user.id;
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

// Create New Review or update the review
exports.createProductReview = catchAsyncErrors(async(req,res,next)=>{
   const {rating,comment,productId} = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
        } 

        const product = await Product.findById(productId);

        const isReviewed = product.reviews.find(rev=>{
            rev.user.toString() === review.user._id.toString()
        })

        if(isReviewed){
            product.reviews.forEach(rev=>{
                //this check ki usi particular review ko update kre 
                if(rev.user.toString() === review.user._id){
                rev.rating = rating,
                rev.comment = comment
                }
            })
        }
        else{
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        //also update overall rating
        let avg =0;
        product.reviews.forEach(rev=>{
            avg = avg + rev.rating;
        })
        product.ratings = avg/product.reviews.length

        await product.save({validateBeforeSave: false})

        res.status(200).json({
            success: true,
        })
})

//Get All reviews of a single product
exports.getProductReviews = catchAsyncErrors(async(req, res, next)=>{
    const product = await Product.findById(req.query.id);
    if(!product){
     return next(new ErrorHandler(404, "Product not found"))
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })
})


//Delete review
exports.deleteReview = catchAsyncErrors(async(req, res, next)=>{
    const product = await Product.findById(req.query.productId);
    if(!product){
        return next(new ErrorHandler(404, "Product not found"))
       }

       const reviews = product.reviews.filter(rev => rev._id.toString()!==req.query.id.toString()) 
       let avg =0;
       reviews.forEach(rev=>{
           avg = avg + rev.rating;
       })
       const ratings = avg/reviews.length
       const numOfReviews = reviews.length;

       await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        numOfReviews,
        ratings
       },{
        new:true,
        runValidators: true,
        useFindAndModify: false
    })
   
       res.status(200).json({
           success: true,
       })

})