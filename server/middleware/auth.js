import User from "../models/User.js";
import jwt from "jsonwebtoken";

//Middleware to protect routes
export const protectRoute = async (req,res,next)=>{
    try {
        console.log("Verified Route");
        const token = req.headers.token;
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.json({success: false, message: "User not found"});
        }
        
        //Express passes the same req object through all middleware and the final route.
        // By adding req.user, you essentially store information for this request
        // It disappears after the request is done — no risk of leaking data between users.
        req.user = user; //magic part
        next();
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}