import { RequestHandler } from "express";
import { PerplexityRequest, PerplexityResponse } from "@shared/api";
import { perplexityService } from "../services/perplexity";

export const handlePerplexityQuery: RequestHandler = async (req, res) => {
  try {
    // Handle Buffer body (Netlify Functions issue)
    let requestBody = req.body;
    if (req.body && typeof req.body === 'object' && req.body.type === 'Buffer') {
      const buffer = Buffer.from(req.body.data);
      requestBody = JSON.parse(buffer.toString());
    }
    
    const { query, pdfContent, model }: PerplexityRequest = requestBody;

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
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('PERPLEXITY_API_KEY')) {
      return res.status(400).json({
        error: "Configuration Error",
        message: "Perplexity API key is not configured. Please set the PERPLEXITY_API_KEY environment variable."
      });
    }
    
    res.status(500).json({
      error: "Failed to process query",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const handlePerplexityWithPDF: RequestHandler = async (req, res) => {
  try {
    console.log("=== Perplexity PDF Request ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("Body type:", typeof req.body);
    console.log("Body keys:", Object.keys(req.body || {}));
    console.log("Environment check - PERPLEXITY_API_KEY:", process.env.PERPLEXITY_API_KEY ? "SET" : "MISSING");
    console.log("API Key preview:", process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.substring(0, 10) + "..." : "NOT_SET");
    
    // Handle Buffer body (Netlify Functions issue)
    let requestBody = req.body;
    if (req.body && typeof req.body === 'object' && req.body.type === 'Buffer') {
      console.log("Detected Buffer body, parsing JSON...");
      const buffer = Buffer.from(req.body.data);
      requestBody = JSON.parse(buffer.toString());
      console.log("Parsed body:", JSON.stringify(requestBody, null, 2));
    } else {
      console.log("Using body as-is (not a Buffer)");
      requestBody = req.body;
    }
    
    const { query, pdfContent }: { query: string; pdfContent: string } = requestBody;

    console.log("Parsed values - query:", query, "pdfContent length:", pdfContent?.length || 0);
    console.log("Query type:", typeof query, "Query value:", JSON.stringify(query));
    console.log("PDFContent type:", typeof pdfContent, "PDFContent value:", JSON.stringify(pdfContent?.substring(0, 100) || ""));

    if (!query || query.trim() === '') {
      console.log("ERROR: Missing or empty query");
      return res.status(400).json({ 
        error: "Query is required",
        received: { 
          query, 
          queryType: typeof query, 
          queryLength: query?.length || 0,
          pdfContentLength: pdfContent?.length || 0,
          bodyKeys: Object.keys(requestBody || {}),
          rawBody: JSON.stringify(requestBody)
        }
      });
    }

    // Make pdfContent optional - if not provided, we'll still process the query
    if (!pdfContent || pdfContent.trim() === '') {
      console.log("WARNING: No PDF content provided, proceeding with query only");
      // Instead of returning 400, we'll proceed with just the query
      const response: PerplexityResponse = await perplexityService.query({
        query,
        pdfContent: undefined,
        model: "sonar-pro"
      });
      
      console.log("✓ Perplexity response received (query only)");
      return res.json(response);
    }

    console.log("✓ Validation passed - Query length:", query.length, "PDF content length:", pdfContent.length);

    const response: PerplexityResponse = await perplexityService.queryWithPDF(pdfContent, query);

    console.log("✓ Perplexity response received");
    res.json(response);
  } catch (error) {
    console.error("Perplexity PDF query error:", error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('PERPLEXITY_API_KEY')) {
      return res.status(400).json({
        error: "Configuration Error",
        message: "Perplexity API key is not configured. Please set the PERPLEXITY_API_KEY environment variable."
      });
    }
    
    res.status(500).json({
      error: "Failed to process PDF query",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
