import fs from "fs";
import pdfParse from "pdf-parse";


import PDF from "../models/PDF";
import { AuthRequest } from "../middleware/authMiddleware";

export const uploadPDF = async (
  req: AuthRequest,
  res: any
) => {
  console.log("FILE =>", req.file);
  console.log("BODY =>", req.body);

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF uploaded",
      });
    }

    // ...

    const buffer = fs.readFileSync(
      req.file.path
    );

    const data = await pdfParse(buffer);

    const pdf = await PDF.create({
      userId: req.user.userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedText: data.text,
    });

    res.status(201).json({
      success: true,
      pdf,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getMyPDFs = async (
  req: AuthRequest,
  res: any
) => {
  try {
    const pdfs = await PDF.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pdfs.length,
      pdfs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};