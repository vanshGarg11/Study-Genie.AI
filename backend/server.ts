import dotenv from "dotenv";
dotenv.config();
//console.log("Razorpay Key:", process.env.RAZORPAY_KEY_ID);
import app from "./src/app";
import connectDB from "./src/config/db";

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});