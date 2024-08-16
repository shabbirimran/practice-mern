
import dotenv from "dotenv"
import mongoose from "mongoose";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env",
})


connectDB()










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