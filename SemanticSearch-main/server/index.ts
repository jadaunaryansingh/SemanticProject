import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handlePerplexityQuery, handlePerplexityWithPDF } from "./routes/perplexity";
import { handlePDFUpload, uploadMiddleware } from "./routes/pdf";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Debug endpoint to check environment variables
  app.get("/api/debug/env", (_req, res) => {
    console.log("Debug env check - PERPLEXITY_API_KEY:", process.env.PERPLEXITY_API_KEY ? "SET" : "MISSING");
    res.json({
      PDF_CO_API_KEY: process.env.PDF_CO_API_KEY ? "SET" : "MISSING",
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ? "SET" : "MISSING",
      NODE_ENV: process.env.NODE_ENV,
      PERPLEXITY_KEY_PREVIEW: process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.substring(0, 10) + "..." : "NOT_SET"
    });
  });

  // Simple test endpoint for Perplexity API
  app.post("/api/test-perplexity", async (_req, res) => {
    try {
      if (!process.env.PERPLEXITY_API_KEY) {
        return res.status(400).json({
          error: "PERPLEXITY_API_KEY not set",
          environment: process.env.NODE_ENV
        });
      }
      
      res.json({
        status: "API key is configured",
        environment: process.env.NODE_ENV,
        keyPreview: process.env.PERPLEXITY_API_KEY.substring(0, 10) + "..."
      });
    } catch (error) {
      res.status(500).json({
        error: "Test failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/demo", handleDemo);

  // Perplexity API routes
  app.post("/api/perplexity/query", handlePerplexityQuery);
  app.post("/api/perplexity/query-with-pdf", handlePerplexityWithPDF);

  // PDF processing routes
  app.post("/api/pdf/upload", uploadMiddleware, handlePDFUpload);

  return app;
}
