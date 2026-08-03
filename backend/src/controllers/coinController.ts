import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  getBalance,
  getTransactionHistory,
} from "../services/coinService";

export const getCoinBalance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const coins = await getBalance(req.user.userId);

    res.status(200).json({
      success: true,
      coins,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getCoinHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const history = await getTransactionHistory(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};