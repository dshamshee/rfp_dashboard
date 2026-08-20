import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

/**
 * Schema describing the structured output we want Gemini to return.
 * Maps directly to the TenderFormData Zod schema fields.
 */
const tenderExtractionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    tenderId: { type: SchemaType.STRING, description: "Tender reference number / ID (e.g. '19(70)/DIT/TSDC(Aug)/2025')", nullable: true },
    title: { type: SchemaType.STRING, description: "Full title of the tender / RFP" },
    client: { type: SchemaType.STRING, description: "Organization / department issuing the tender" },
    location: { type: SchemaType.STRING, description: "Location / city / state where the work is to be done", nullable: true },
    tenderValue: { type: SchemaType.NUMBER, description: "Estimated tender value in INR (just the number, no currency symbols). Convert lakh/crore to actual number.", nullable: true },
    emd: { type: SchemaType.NUMBER, description: "Earnest Money Deposit amount in INR (just the number). Convert lakh/crore to actual number.", nullable: true },
    tenderFee: { type: SchemaType.NUMBER, description: "Tender fee / document cost in INR (just the number).", nullable: true },
    publishDate: { type: SchemaType.STRING, description: "Date of publishing the tender in ISO format YYYY-MM-DD", nullable: true },
    preBidDate: { type: SchemaType.STRING, description: "Pre-bid meeting date in ISO format YYYY-MM-DD", nullable: true },
    lastDate: { type: SchemaType.STRING, description: "Last date for submission of bid in ISO format YYYY-MM-DD", nullable: true },
    openingDate: { type: SchemaType.STRING, description: "Date of opening of bids (technical/pre-qualification) in ISO format YYYY-MM-DD", nullable: true },
    priority: { type: SchemaType.STRING, description: "Inferred priority: HIGH if tender value > 1 crore or tight deadline, MEDIUM otherwise, LOW if long deadline and small value. Must be one of: HIGH, MEDIUM, LOW", nullable: true },
    eligibility: { type: SchemaType.STRING, description: "Must be exactly 'ELIGIBLE' or 'NOT ELIGIBLE'. Set to null if cannot determine.", nullable: true },
    remarks: { type: SchemaType.STRING, description: "Brief summary of key highlights, scope of work, and important notes from the tender document (2-3 sentences max)", nullable: true },
  },
  required: ["title", "client"],
};

const SYSTEM_PROMPT = `You are an expert Indian government tender document analyzer. Your job is to extract structured metadata from tender / RFP (Request for Proposal) PDF documents.

RULES:
1. Extract ONLY information that is explicitly stated in the document. Do NOT guess or hallucinate.
2. For monetary values (tenderValue, emd, tenderFee): Convert Indian number formats to plain numbers.
   - "Rs. 10,00,000" = 1000000
   - "Rs. 5,000" = 5000
   - "Rs. 1.5 Crore" = 15000000
   - "Rs. 50 Lakh" = 5000000
3. For dates: Convert to ISO format YYYY-MM-DD.
   - "23.07.2026" = "2026-07-23"
   - "23/07/2026" = "2026-07-23"
   - "July 23, 2026" = "2026-07-23"
4. For priority: Infer based on tender value and deadline urgency.
   - HIGH: tender value > 1 crore OR less than 15 days to submit
   - MEDIUM: tender value between 10 lakh and 1 crore
   - LOW: tender value < 10 lakh AND more than 30 days to submit
5. The "title" should be the full descriptive title of the work / project, not just "RFP".
6. The "client" should be the issuing organization name.
7. If a field cannot be found in the document, return null for that field.
8. For the "openingDate", look for "Date and Time of Opening of Pre-qualification & Technical Bids" or similar.
9. For remarks, provide a concise 2-3 sentence summary of the scope of work.`;

export interface ExtractedTenderData {
  tenderId?: string | null;
  title: string;
  client: string;
  location?: string | null;
  tenderValue?: number | null;
  emd?: number | null;
  tenderFee?: number | null;
  publishDate?: string | null;
  preBidDate?: string | null;
  lastDate?: string | null;
  openingDate?: string | null;
  priority?: string | null;
  eligibility?: string | null;
  remarks?: string | null;
}

/**
 * Extract structured tender data from raw PDF text using Gemini AI.
 */
export async function extractTenderFromText(rawText: string): Promise<ExtractedTenderData> {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not configured. Please add it to your .env file.");
  }

  // Truncate text if too long (Gemini has token limits)
  const maxChars = 60000;
  const truncatedText = rawText.length > maxChars
    ? rawText.substring(0, maxChars) + "\n\n[... document truncated ...]"
    : rawText;

  const promptText = `Extract the tender metadata from the following document text:\n\n---\n${truncatedText}\n---`;
  const candidateModels = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
  ];

  let lastError: any;
  for (const modelName of candidateModels) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const activeModel = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: tenderExtractionSchema as any,
            temperature: 0.1, // Low temperature for factual extraction
          },
          systemInstruction: SYSTEM_PROMPT,
        });

        const result = await activeModel.generateContent(promptText);
        const responseText = result.response.text();
        const parsed: ExtractedTenderData = JSON.parse(responseText);
        return parsed;
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.statusCode;
        const isRateOrCapacity = status === 429 || status === 503 || (err?.message && (err.message.includes("quota") || err.message.includes("high demand") || err.message.includes("overloaded") || err.message.includes("CAPACITY")));
        
        console.warn(`Model ${modelName} (attempt ${attempt}/3) failed:`, err?.message || err);

        // If rate limited or service unavailable, wait before retrying or switching model
        if (isRateOrCapacity && attempt < 3) {
          const delayMs = attempt * 3000;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          break; // Try next model if non-retriable error or max attempts reached
        }
      }
    }
  }

  throw lastError || new Error("Failed to extract tender data with Gemini AI. All model retries exhausted.");
}
