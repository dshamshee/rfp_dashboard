import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PDFDocument } from "pdf-lib";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { extractTenderFromText } from "@/lib/ai/gemini";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No PDF file provided." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit for extraction
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit.`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- Step 1: Extract raw text from PDF ---
    let rawText: string;
    try {
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text;

      if (!rawText || rawText.trim().length < 50) {
        return NextResponse.json(
          {
            success: false,
            error: "Could not extract readable text from this PDF. The document may be scanned/image-based.",
          },
          { status: 422 }
        );
      }
    } catch (pdfErr: any) {
      console.error("PDF text extraction failed:", pdfErr);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse PDF document. The file may be corrupted or password-protected.",
        },
        { status: 422 }
      );
    }

    // --- Step 2: Extract structured data using Gemini AI ---
    let extractedData;
    try {
      extractedData = await extractTenderFromText(rawText);
    } catch (aiErr: any) {
      console.error("Gemini AI extraction failed:", aiErr);
      return NextResponse.json(
        {
          success: false,
          error: aiErr?.message || "AI extraction failed. Please check your GOOGLE_GEMINI_API_KEY.",
        },
        { status: 500 }
      );
    }

    // --- Step 3: Upload PDF to Cloudinary (compress first) ---
    let documentUrl: string | null = null;
    try {
      let finalBuffer: Buffer = buffer;

      // Attempt compression with pdf-lib
      try {
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        pdfDoc.setTitle("");
        pdfDoc.setAuthor("");
        pdfDoc.setSubject("");
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer("RFP Dashboard PDF Optimizer");
        pdfDoc.setCreator("RFP Dashboard");
        const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
        finalBuffer = Buffer.from(compressedBytes);
      } catch {
        // Fallback to original buffer if compression fails
        finalBuffer = buffer;
      }

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "rfp_tenders_pdf",
            resource_type: "raw",
            public_id: `tender_doc_${Date.now()}`,
            format: "pdf",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(finalBuffer);
      });

      documentUrl = uploadResult.secure_url;
    } catch (uploadErr: any) {
      // Non-fatal: we still have the extracted data even if upload fails
      console.warn("Cloudinary upload failed (non-fatal):", uploadErr?.message);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...extractedData,
          documentUrl,
        },
        textLength: rawText.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Extract tender API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "An unexpected error occurred during PDF extraction.",
      },
      { status: 500 }
    );
  }
}
