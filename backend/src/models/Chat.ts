import mongoose, { Document, Schema } from "mongoose";

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  pdfId: mongoose.Types.ObjectId;

  chatId: string;

  title: string;

  question: string;
  answer: string;

  pinned: boolean;

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pdfId: {
      type: Schema.Types.ObjectId,
      ref: "PDF",
      required: true,
    },

    chatId: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    pinned: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({
  userId: 1,
  pdfId: 1,
  chatId: 1,
});

export default mongoose.model<IChat>("Chat", chatSchema);