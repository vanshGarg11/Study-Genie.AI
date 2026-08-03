import User from "../models/User";
import CoinTransaction from "../models/CoinTransaction";

export const addCoins = async (
  userId: string,
  amount: number,
  reason: string
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.coins += amount;
  await user.save();

  await CoinTransaction.create({
    userId,
    type: "credit",
    amount,
    reason,
  });

  return user;
};
export const deductCoins = async (
  userId: string,
  amount: number,
  reason: string
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.coins < amount) {
    throw new Error("INSUFFICIENT_COINS");
  }

  user.coins -= amount;
  await user.save();

  await CoinTransaction.create({
    userId,
    type: "debit",
    amount,
    reason,
  });

  return user;
};

export const getBalance = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user.coins;
};

export const getTransactionHistory = async (
  userId: string
) => {
  return await CoinTransaction.find({ userId })
    .sort({ createdAt: -1 });
};