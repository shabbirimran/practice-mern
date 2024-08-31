import {asyncHandler} from '../utils/asyncHandler.js'
import {Apierror} from '../utils/Apierror.js'
import {User} from '../models/User.model.js'
import {uploadOnCloudinary} from '../utils/Cloudinary.js'
import {Apiresponse} from '../utils/Apiresponse.js'
import jwt from 'jsonwebtoken'

const generateAccessandRefreshtokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return{
            accessToken,refreshToken
        }
    } catch (err) {
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
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingAccessToken =req.cookies?.refreshToken || req.body.refreshToken
    if(!incomingAccessToken){
        throw new Apierror(401,"unauthorized token")
    }
try {
        const decodedToken=jwt.verify(incomingAccessToken,process.env.REFRESH_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new Apierror(401,"invalid refresh token")
        }
        if(incomingAccessToken !== user.refreshToken){
            throw new Apierror(401,"refresh token is expired or used")
        }
        const {accessToken,newrefreshToken}=await generateAccessandRefreshtokens(user._id)
        const options={
            httpOnly:true,
            secure:true,
        }
        res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("newrefreshToken",newrefreshToken,options)
        .json(
            200,
            {user:accessToken,refreshToken:newrefreshToken},
            "Access Token refresh Successfully"
    
        )
} catch (error) {
    throw new Apierror(400,error?.message || "invalid refresh token")
}
    
})
const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword,cnfrmPassword} =req.body
    console.log(oldPassword)
    if(!(newPassword === cnfrmPassword)){
        throw new Apierror(404,"password does not match")
    }
try {
        const user=await User.findById(req.user?._id)
        if(!user){
            throw new Apierror(400,"invalid user")
        }
        const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
        if(!isPasswordCorrect){
            throw new Apierror(400,"Incorrect Password")
        }
        user.password=newPassword
        await user.save({validateBeforeSave:false}) 
    return res.status(200).json(
        new Apiresponse(200,{},"succesfully updated the password")
    )
} catch (error) {
    throw new Apierror(400,error?.message|| "sorry password not updated")
}
})
const getcurrentUser=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user?._id)
    if(!user){
        throw new Apierror(400,"invalid user")
    }
    return res.status(200).json(
        new Apiresponse(200,{user:req.user},"fetch user successfully")
    )
})
const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {username,fullname,email}=req.body
    if(!(username||fullname||email)){
        throw new Apierror(404,"field is missing")
    }
    const user=await User.findByIdAndUpdate(req.user?._id
        ,
        {username,
            fullname,
            email
        },
        {
            new:true
        }
        ).select("-password")
        return res.status(200).json(
            new Apiresponse(200,user,"Account details update successfully")
        )
})
const updateAvatar=asyncHandler(async(req,res)=>{
    const avatarpath=req.file?.path
    const uploadCloudinary= await uploadOnCloudinary(avatarpath)
    if(!uploadCloudinary){
        throw new Apierror(404,"avatar not upload on cloudinary")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:uploadCloudinary.url
            },
        },
        {
            new:true
        }

    ).select("-password")
    return res.status(200).json(
        new Apiresponse(200,user,"Avatar Image Upload on Successfully")
    )
})
const updatecoverImage=asyncHandler(async(req,res)=>{
    const coverpath=req.file?.path
    const uploadCloudinary= await uploadOnCloudinary(coverpath)
    if(!uploadCloudinary){
        throw new Apierror(404,"avatar not upload on cloudinary")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage:uploadCloudinary.url
            },
        },
        {
            new:true
        }

    ).select("-password")
    return res.status(200).json(
        new Apiresponse(200,user,"Avatar Image Upload on Successfully")
    )
})
const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params
    if(!username.trim()){
        throw new Apierror(404,"username is missing")
    }
    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase(),
            }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:_.id,
            foreignField:channel,
            as:subscribers
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:_.id,
            foreignField:subscribers,
            as:subscribedTo
        }
    },{
        $addFields:{
            subscribersCount:{
                $size:"$subscribers"
            },
            channelsSubscribedToCount:{
                $size:"$subscribedTo"
            },
            isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscribers"]},
                    then:true,
                    else:false
                
                }
            }
        },
        
    },
    {
        $project:{
            fullname:1,
            username:1,
            subscribersCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1

        }
    }
])
})
export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getcurrentUser,updateAccountDetails,updateAvatar,updatecoverImage,getUserChannelProfile}