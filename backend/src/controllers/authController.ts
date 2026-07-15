import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import CoinTransaction from "../models/CoinTransaction";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      coins: 100,
    });
     await CoinTransaction.create({
      userId: user._id,
      type: "credit",
      amount: 100,
      reason: "Signup Bonus",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        coins: user.coins,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        coins: user.coins,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

    
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};