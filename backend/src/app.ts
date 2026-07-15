import express from "express"
import cors from "cors"

import authRoutes from "./routes/authRoutes";
import coinRoutes from "./routes/coinRoutes";
import aiRoutes from "./routes/aiRoutes";
import pdfRoutes from "./routes/pdfRoutes";


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


export default app;

