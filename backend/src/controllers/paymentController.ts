import { Response } from "express";
import crypto from "crypto";

import { razorpay } from "../config/razorpay";
import { AuthRequest } from "../middleware/authMiddleware";

import Payment from "../models/Payment";
import { addCoins } from "../services/coinService";

const coinPackages: Record<number, number> = {
  100: 49,
  250: 99,
  500: 199,
  1000: 349,
};

export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { coins } = req.body;

    const amount = coinPackages[coins];

    if (!amount) {
      res.status(400).json({
        success: false,
        message: "Invalid coin package",
      });
      return;
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
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
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
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

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET!
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
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
        message: "Payment not found",
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
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getPaymentHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const payments = await Payment.find({
      userId: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .select(
        "amount coins status orderId paymentId createdAt"
      );

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getPaymentById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.paymentId,
      userId: req.user.userId,
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
