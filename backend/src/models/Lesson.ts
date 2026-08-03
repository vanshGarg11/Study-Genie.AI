import mongoose, { Schema, Document } from "mongoose";

export interface ILesson extends Document {
    userId: mongoose.Types.ObjectId;
    pdfId: mongoose.Types.ObjectId;
    title: string;
    slides: {
        heading: string;
        content: string[];
        speakerNotes: string;
    }[];
    quiz: {
        question: string;
        options: string[];
        answer: string;
    }[];
    createdAt: Date;
}

const lessonSchema = new Schema<ILesson>(
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

        slides: [
            {
                heading: String,

                content: [String],

                speakerNotes: String,
            },
        ],

        quiz: [
            {
                question: String,

                options: [String],

                answer: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ILesson>("Lesson", lessonSchema);