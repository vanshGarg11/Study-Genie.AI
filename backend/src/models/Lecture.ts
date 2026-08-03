import mongoose, { Document, Schema } from "mongoose";

export interface ILecture extends Document {
  userId: mongoose.Types.ObjectId;
  pdfId: mongoose.Types.ObjectId;
  title: string;
  currentSegment: number;
  status: "teaching" | "paused" | "completed";
  segments: {
    heading: string;
    objective: string;
    script: string;
    recap: string;
    checkpointQuestion: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const lectureSchema = new Schema<ILecture>(
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
    title: {
      type: String,
      required: true,
    },
    currentSegment: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["teaching", "paused", "completed"],
      default: "paused",
    },
    segments: [
      {
        heading: String,
        objective: String,
        script: String,
        recap: String,
        checkpointQuestion: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILecture>("Lecture", lectureSchema);
