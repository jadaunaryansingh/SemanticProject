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
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Debug endpoint to check environment variables
  app.get("/api/debug/env", (_req, res) => {
    res.json({
      PDF_CO_API_KEY: process.env.PDF_CO_API_KEY ? "SET" : "MISSING",
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ? "SET" : "MISSING",
      NODE_ENV: process.env.NODE_ENV
    });
  });

  app.get("/api/demo", handleDemo);

  // Perplexity API routes
  app.post("/api/perplexity/query", handlePerplexityQuery);
  app.post("/api/perplexity/query-with-pdf", handlePerplexityWithPDF);

  // PDF processing routes
  app.post("/api/pdf/upload", uploadMiddleware, handlePDFUpload);

  return app;
}
