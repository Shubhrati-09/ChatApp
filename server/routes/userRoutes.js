import express from "express";
import { checkAuth, deleteUser, login, signup, updateProfile, restoreUser } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup",signup);
userRouter.post("/login",login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);
userRouter.put("/delete-user/:id", protectRoute, deleteUser);
userRouter.post("/restore",restoreUser);
export default userRouter;