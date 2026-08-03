import { Response } from "express";
import { deductCoins } from "../services/coinService";

export const handleCoinDeduction = async (
  userId: string,
  amount: number,
  reason: string,
  res: Response
): Promise<boolean> => {
  try {
    await deductCoins(userId, amount, reason);
    return true;
  } catch (error: any) {
    if (error.message === "INSUFFICIENT_COINS") {
      res.status(400).json({
        success: false,
        message: "Insufficient Coins",
      });

      return false;
    }

    throw error;
  }
};