class ApiFeatures {
    constructor(query,queryStr){
        this.query = query
        this.queryStr = queryStr
    }
    search(){
        // ternay operator to know keyword found or not 
        // if found then search like this eg samosa so it should also search somasamosa
        const keyword = this.queryStr.keyword ? {
            //making how name look likes
            name: {
                $regex: this.queryStr.keyword, //used for pattern matching
                $options: "i", // this do case insensitve
            }
        }:{};

        this.query = this.query.find({...keyword})
        return this
        //return this class so in Product.find use apiFeature.query becoz class fun are accessable
    }

    filter(){
        const queryCopy = {...this.queryStr}

        //Removing field for category
        const removeFields = ["keyword","page","limit"]

        removeFields.forEach(key=>{
            delete queryCopy[key]
        })

        //filter for price
        let queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=>`$${key}`)
        
        this.query = this.query.find(JSON.parse(queryStr))
   
        return this
    }

    //pagination
    pagination(resultPerPage){
        //if not page is given then default 1
        const currentPage = Number(this.queryStr.page) || 1;
        
        const skip = resultPerPage*(currentPage-1)

        this.query.limit(resultPerPage).skip(skip)

        return this
    }

}

module.exports = ApiFeatures