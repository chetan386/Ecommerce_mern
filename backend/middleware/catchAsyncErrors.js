module.exports = theFunc=> (req,res,next) =>{
    
    //Promise is a js prebuild class
    // this only try catch block
    Promise.resolve(theFunc(req,res,next)).catch(next)
}