/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Perplexity API types
 */
export interface PerplexityRequest {
  query: string;
  pdfContent?: string;
  model?: string;
}

export interface PerplexityResponse {
  answer: string;
  sources?: string[];
  citations?: string[];
}

export interface PerplexityError {
  error: string;
  message: string;
}

/**
 * PDF processing types
 */
export interface PDFUploadRequest {
  file: File;
}

export interface PDFProcessResponse {
  text: string;
  success: boolean;
  error?: string;
}
