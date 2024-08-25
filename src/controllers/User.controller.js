import {asyncHandler} from '../utils/asyncHandler.js'
import {Apierror} from '../utils/Apierror.js'
import {User} from '../models/User.model.js'
import {uploadOnCloudinary} from '../utils/Cloudinary.js'
import {Apiresponse} from '../utils/Apiresponse.js'
const registerUser=asyncHandler(async(req,res)=>{
   // get user details from frontend
   // validation - not empty
   // check if user already exists
    //check for images and avatar
    //upload them to cloudinary,avatar
    // create user object- create entry in db
    //remove password and refresh token field from response
    //check for user creation 
    //return res or error
    const {username,fullname,email,password}=req.body
    console.log("email is",email)
    if([username,fullname,email,password].some((field)=>field?.trim() ==="")){
        throw new Apierror(400,`${field} is required`)
    }
    const existedUser=await User.findOne({$or:[{username},{email}]})
    if(existedUser){
        throw new Apierror(409,`user is existed`)

    }
    const avatarLocalPath=req.files?.avatar[0]?.path
    console.log("avatarlocalpath",avatarLocalPath)
    const coverImageLocalPath=req.files?.coverImage[0]?.path
    console.log("coverIamagelocalPath",req.files)
if(!avatarLocalPath){
    throw new Apierror(400,"avatar file is required")
}
const avatar=await uploadOnCloudinary(avatarLocalPath)
console.log("cloudinary",avatar)
if(!avatar){
    throw new Apierror(400,"avatar file is required")
}
const coverImage=await uploadOnCloudinary(coverImageLocalPath)
const user=await User.create({
    username:username.toLowerCase(),
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,

})
const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
)
console.log("createdusers",createdUser)
if(!createdUser){
    throw new Apierror(500,"something went wrong while register")
}
return res.status(200).json(
    new Apiresponse(200,createdUser,"User Register succesfully")
)

})
export {registerUser}