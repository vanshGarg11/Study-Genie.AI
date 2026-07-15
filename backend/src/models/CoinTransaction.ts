import mongoose, { Document, Schema } from "mongoose";

export interface ICoinTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  reason: string;
  createdAt: Date;
}

const coinTransactionSchema = new Schema<ICoinTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICoinTransaction>(
  "CoinTransaction",
  coinTransactionSchema
);