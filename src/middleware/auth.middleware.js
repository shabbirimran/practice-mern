import jwt from "jsonwebtoken";
import { Apierror } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookie.accessToken || req.header("Authorization").replace("Bearer ","")
        if(!token){
            throw new Apierror(401,"unauthoried request")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
      const user=  await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new Apierror(401,"invalid acess token")
        }
        req.user=user
        next()
    } catch (error) {
        throw new Apierror(401,error?.message || "invalid acess token")
    }
})