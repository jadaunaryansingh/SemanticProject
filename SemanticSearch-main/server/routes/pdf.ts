import { RequestHandler } from "express";
import multer from "multer";
import { PDFProcessResponse } from "@shared/api";
import { pdfProcessor } from "../services/pdfProcessor";

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

export const handlePDFUpload: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

    const arrayBuffer: ArrayBuffer = req.file.buffer.buffer.slice(
      req.file.buffer.byteOffset,
      req.file.buffer.byteOffset + req.file.buffer.byteLength
    );

    const result: PDFProcessResponse = {
      text: await pdfProcessor.extractTextFromBuffer(arrayBuffer, req.file.originalname || 'document.pdf')
        .then((text) => text)
        .catch((err: unknown) => {
          throw err;
        }),
      success: true
    };

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("PDF upload error:", error);
    res.status(500).json({
      text: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Middleware for handling file uploads
export const uploadMiddleware = upload.single("pdf");
