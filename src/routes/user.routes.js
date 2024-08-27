import {Router} from "express";
import {upload} from '../middleware/multer.middleware.js'
import {loginUser, logoutUser, registerUser,refreshAccessToken} from '../controllers/User.controller.js'
import { verifyJWT } from "../middleware/auth.middleware.js";
const router=Router()
router.route("/register").post(upload.fields([
    {name:"avatar",maxCount:1},{name:"coverImage",maxCount:1}
]),
    registerUser)
router.route("/loginn").post(loginUser)
//secure routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
export default router;