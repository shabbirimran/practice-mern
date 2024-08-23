
import dotenv from "dotenv"
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./env",
})


connectDB()
.then(()=>{

    app.listen(process.env.PORT || 3000,()=>{
        console.log(`server is ruuning at ${process.env.PORT}`)
    }).on("error",(err)=>{
        console.log(`server error`,err)
    })
    
})
.catch(err=>{
    console.log("Mongodb connection failed!",err);
})









// import express from "express";

// const app=express()



// ;(async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error",()=>{
//             console.log("Err:",error)
//             throw error
//         })
//         app.Listen(process.env.PORT,()=>{
//             console.log(`App is running on port ${process.env.PORT}`)
//         })
//     }catch(error){
//         console.log("error:", error)
//         throw error
//     }
    
// })()