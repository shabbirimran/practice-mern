import {asyncHandler} from '../utils/asyncHandler.js'
import {Apierror} from '../utils/Apierror.js'
import {User} from '../models/User.model.js'
import {uploadOnCloudinary} from '../utils/Cloudinary.js'
import {Apiresponse} from '../utils/Apiresponse.js'


const generateAccessandRefreshtokens=async(userId)=>{
    try {
        const user=User.findById(userId)
        console.log(user,"users")
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return{
            accessToken,refreshToken
        }
    } catch (error) {
        throw new Apierror(500,"something went wrong while generating refresh and access token")
    }
}

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
const loginUser=asyncHandler(async(req,res)=>{
   //username email password req from body
   //validate username,email,password
   //user exists
   //password check
   //accesstoken and refreshtoken token generate
   //send token to cookies
   //response
   
    const {username,email,password}=req.body
    console.log(email)
    if(!(username || email)){
        throw new Apierror(400,"username or email is required")
    }
    const user=await User.findOne({
        $or:[{email},{username}]
    })
    if(!user){
        throw new Apierror(400,"email or username does not exists")
    }
  const isPasswordValid= await user.isPasswordCorrect(password)
  if(!isPasswordValid){
    throw new Apierror(400,"Invalid Credentials")
}
    const {accessToken,refreshToken}=await generateAccessandRefreshtokens(user._id)
    const LoggedinUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const options={
        httpOnly:true,
        secure:true,
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new Apiresponse(200,{
            user:LoggedinUser,accessToken,refreshToken
        },
        "successfully loginn"
    ))

})
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{refreshToken:undefined}

            },
            {
                new:true
            }
        
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accesToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new Apiresponse(200,{},"user logged out")
    )
})
export {registerUser,loginUser,logoutUser}