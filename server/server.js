import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import {Server} from "socket.io";
import cron from "node-cron";
import User from "./models/User.js";
import Message from "./models/Message.js";

const ACCOUNT_DELETE_DURATION = parseInt(process.env.ACCOUNT_DELETE_DURATION);

//Creating Express App and HTTP Server
const app = express();
const server = http.createServer(app);

//Initialize the socket.io server
export const io = new Server(server,{
    cors: {origin: "*"}
});

//Store Online Users
export const userSocketMap = {}; // {userId: socketId}

//Socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected ",userId);
    
    if(userId) userSocketMap[userId] = socket.id;
    
    //emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    
    //disconnect event
    socket.on("disconnect",()=>{
        console.log("User Disconnected ",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    })
});

//MiddleWare SetUp
app.use(express.json({limit : "4mb"}));
app.use(cors()); //allow all the URl to connect with backend


//Route Setup
app.use("/api/status", (req,res) => res.send("Server is live"));
app.use('/api/auth',userRouter);
app.use("/api/messages", messageRouter);

app.get("/api/config", (req, res) => {
  res.json({ ACCOUNT_DELETE_DURATION: process.env.ACCOUNT_DELETE_DURATION });
});

// Connect to MongoDB
await connectDB();

if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT || 5001;
    server.listen(PORT,() => console.log("Server is running on PORT: "+PORT));
}    

// Automatically delete users whose accounts are deleted for more than 7 days
cron.schedule("0 0 * * *", async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - ACCOUNT_DELETE_DURATION);

    // Find users who have been deleted for more than 7 days
    const deletedUsers = await User.find({
      isDeleted: true,
      deletedAt: { $lte: sevenDaysAgo },
    });

    for (const user of deletedUsers) {
      console.log(`🧹 Deleting user ${user.fullName} and their messages`);

      // Delete all messages involving this user
      await Message.deleteMany({
        $or: [{ senderId: user._id }, { receiverId: user._id }],
      });

      // Delete the user permanently
      await User.deleteOne({ _id: user._id });
    }

    if (deletedUsers.length > 0)
      console.log(`✅ Cleanup complete: ${deletedUsers.length} users deleted.`);
    else
      console.log("✅ No users to delete today.");

  } catch (error) {
    console.error("❌ Error during cleanup job:", error.message);
  }
});

//exporting for vercel
export default server;