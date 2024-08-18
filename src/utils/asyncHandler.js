const asyncHanlder=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch(err=> next(err));
    }
}







export {asyncHanlder}



// const asyncHandler=(fn)=>async(req,res,nect)=>{
//     try{
//             await fn(req,res,next)
//     }catch(err){
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }