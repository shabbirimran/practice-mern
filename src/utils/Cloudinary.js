import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

    // Configuration
    cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET 
    });
    
    const uploadOnCloudinary=async(localFilePath)=>{
        try{
            if(!localFilePath) return null
           
            let response=await cloudinary.uploader.upload(
           localFilePath, {
              resource_type: "auto",
           })
           //file has been succesfully
           console.log("file has been uploaded on cloudinary",response.url)
           return response
        }catch(error){
            console.log("error on cloudinary file uploaded:",error)
            fs.unlinkSync(localFilePath)//remove the locally temp file as upload operation failed
            return null
        }
    }
    export {uploadOnCloudinary}