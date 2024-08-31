import mongoose, { Schema } from 'mongoose'
const SubccriptionSchema=new Schema(
    {
        subscribers:{
            type: Schema.Types.ObjectId,
            ref:"user"
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref:"user"
        }
    

},{timestamps:true})
export const Subscription=mongoose.model("Subscription", SubccriptionSchema)