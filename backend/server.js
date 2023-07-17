const dotenv = require("dotenv")
const app = require("./app")
const connectDatabase = require("./config/database")

//handling Uncaught exception
process.on("uncaughtException",err=>{
    console.log(`Error ${err.message}`)
    console.log(`Shutting down the server due to Uncaught exception`)
    process.exit(1)
})

//kaise pata chalega konsi env file config karni 
dotenv.config({path:"backend/config/config.env"});

//connecting to database
connectDatabase()

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
})

//Unhandled promise rejection
process.on("unhandledRejection",err=>{
    console.log(`Error ${err.message}`)
    console.log(`Shutting down server due to Unhandled Promise Rejection`);
    server.close(()=>{
        process.exit(1);
    })
})