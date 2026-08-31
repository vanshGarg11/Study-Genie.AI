import { Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";

import { AuthRequest } from "../middleware/authMiddleware";
import Payment from "../models/Payment";
import { addCoins } from "../services/coinService";

const coinPackages: Record<number, number> = {
  50: 49,
  100: 49,
  200: 149,
  250: 99,
  500: 299,
  1000: 349,
};

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_TE2wUyVmLYKPS2";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "crOfFyNWJO3hTkBjjytqgaQZ";
  return new Razorpay({ key_id, key_secret });
};

export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { coins, amount: clientAmount } = req.body;

    const amount = coinPackages[coins] || clientAmount || 49;

    if (!coins || !amount) {
      res.status(400).json({
        success: false,
        message: "Invalid coin package selected",
      });
      return;
    }

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    await Payment.create({
      userId: req.user.userId,
      orderId: order.id,
      amount,
      coins,
      status: "created",
    });

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_TE2wUyVmLYKPS2",
    });
  } catch (error: any) {
    console.error("Razorpay createOrder error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
};

export const verifyPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "crOfFyNWJO3hTkBjjytqgaQZ";

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      res.status(400).json({
        success: false,
        message: "Payment verification signature mismatch",
      });
      return;
    }

    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
      userId: req.user.userId,
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
      return;
    }

    if (payment.status === "paid") {
      res.status(200).json({
        success: true,
        message: "Payment already verified",
      });
      return;
    }

    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = "paid";
    await payment.save();

    await addCoins(
      req.user.userId,
      payment.coins,
      "Razorpay Purchase"
    );

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      coinsAdded: payment.coins,
    });
  } catch (error: any) {
    console.error("Razorpay verifyPayment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

export const getPaymentHistory = async (
  req: AuthRequest,
  res: any
): Promise<void> => {
  try {
    const payments = await Payment.find({
      userId: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .select("amount coins status orderId paymentId createdAt");

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error: any) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPaymentById = async (
  req: AuthRequest,
  res: any
): Promise<void> => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.paymentId,
      userId: req.user.userId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
