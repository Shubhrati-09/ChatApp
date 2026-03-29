//Create user
//Allow user to login
//Authenticate the user
//Function to update user Profile

import v2 from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

//Signup a new User
export const signup = async (req,res) => {
    const {fullName, email, password, bio} = req.body;


    try{
        if(!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing Details."});
        }

        //check if user already there with these details
        const user = await User.findOne({email});
        if(user && !user.isDeleted){
            return res.json({success: false, message: "Account already exists."});
        }
        if(user && user.isDeleted){
            return res.json({success: false, message: "This account was recently deleted. You can log in to restore it, or try again after 7 days."});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id);

        res.json({success: true, userData: newUser, token, message: "Account created successfully!"});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

//Controller to login a user
export const login = async (req,res) => {
    try{
        const {email, password} = req.body;
        const userData = await User.findOne({email});
        //If user does not exists
        if(!userData){
            return res.json({success: false, message: "User does not exists!"});
        }

        //If user exists, but deleted account

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect){
            return res.json({success: false, message: "Invalid Credentials"});
        }

        const token = generateToken(userData._id);

        if(userData.isDeleted){
            return res.json({success: false, deleted: true,message: "This account was deleted recently. Continue to restore it."})
        }

        res.json({success: true, userData, token, message: "Login Successful!" })
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

//Controller to Authenticat user - need a middleware
export const checkAuth = (req,res)=>{
    res.json({success: true, user: req.user})
}

//Controller to update user profile
export const updateProfile = async (req,res)=>{
    try {
        const {profilePic, bio, fullName} = req.body;
        const userId = req.user._id;

        let updatedUser;

        if(!profilePic){
            //only update fullName and bio
            updatedUser = await User.findByIdAndUpdate(userId, {bio,fullName}, {new: true});
        } else {
            const upload = await v2.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url,bio, fullName}, {new: true});
        }

        res.json({success: true, user: updatedUser});
    } catch (error) {
        console.log(error.message);
        res.json({success: true, message: error.message})
    }
}

//controller to delete a User
export const deleteUser = async(req,res) => {
    try {
        const userId = req.params.id;
        updatedUser = await User.findByIdAndUpdate(userId, {
            bio: "" , 
            fullName: "ChatApp User", 
            profilePic: "",
            isDeleted: true,
            deletedAt: new Date(),
        },{new: true});

        if (!updatedUser)
            return res.status(404).json({ success: false, message: "User not found" });

        res.json({success: true});
    } catch (error) {
        console.log(error.message);
        res.json({success: true, message: error.message})
    }
}

//Controller to restore a User
export const restoreUser = async(req,res) => {
    try {
        const {fullName, bio, email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.json({success: false, message:"User does not exists."});
        }
        if(!user.isDeleted){
            return res.json({success: false, message: "User is Already active."});
        }

        const restoredUser = await User.findByIdAndUpdate(user._id, {fullName,bio,isDeleted:false , deletedAt: null},{new: true});
        const token = generateToken(user._id);
        res.json({success: true, userData: restoredUser, token, message:"Account restored successfully!"});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}