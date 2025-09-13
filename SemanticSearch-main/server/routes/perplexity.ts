import { RequestHandler } from "express";
import { PerplexityRequest, PerplexityResponse } from "@shared/api";
import { perplexityService } from "../services/perplexity";

export const handlePerplexityQuery: RequestHandler = async (req, res) => {
  try {
    const { query, pdfContent, model }: PerplexityRequest = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const response: PerplexityResponse = await perplexityService.query({
      query,
      pdfContent,
      model
    });

    res.json(response);
  } catch (error) {
    console.error("Perplexity query error:", error);
    res.status(500).json({
      error: "Failed to process query",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const handlePerplexityWithPDF: RequestHandler = async (req, res) => {
  try {
    console.log("=== Perplexity PDF Request ===");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("Body type:", typeof req.body);
    console.log("Body keys:", Object.keys(req.body || {}));
    
    const { query, pdfContent }: { query: string; pdfContent: string } = req.body;

    if (!query || query.trim() === '') {
      console.log("ERROR: Missing or empty query");
      return res.status(400).json({ 
        error: "Query is required",
        received: { query, pdfContentLength: pdfContent?.length || 0 }
      });
    }

    if (!pdfContent || pdfContent.trim() === '') {
      console.log("ERROR: Missing or empty pdfContent");
      return res.status(400).json({ 
        error: "PDF content is required",
        received: { queryLength: query?.length || 0, pdfContent }
      });
    }

    console.log("✓ Validation passed - Query length:", query.length, "PDF content length:", pdfContent.length);

    const response: PerplexityResponse = await perplexityService.queryWithPDF(pdfContent, query);

    console.log("✓ Perplexity response received");
    res.json(response);
  } catch (error) {
    console.error("Perplexity PDF query error:", error);
    res.status(500).json({
      error: "Failed to process PDF query",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
