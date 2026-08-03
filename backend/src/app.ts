import express from "express"
import cors from "cors"

import authRoutes from "./routes/authRoutes";
import coinRoutes from "./routes/coinRoutes";
import aiRoutes from "./routes/aiRoutes";
import pdfRoutes from "./routes/pdfRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import userRoutes from "./routes/userRoutes";
import lessonRoutes from "./routes/lessonRoutes";
import lectureRoutes from "./routes/lectureRoutes";

const app = express()
app.use(cors());
app.use(express.json())

app.get("/",(req,res)=>{
    res.send("API IS RUNNING ")
});
app.use("/api/auth", authRoutes);
app.use("/api/coins", coinRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/lesson", lessonRoutes);   
app.use("/api/lecture", lectureRoutes);
export default app;

