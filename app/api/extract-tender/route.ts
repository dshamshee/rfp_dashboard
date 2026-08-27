import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PDFDocument } from "pdf-lib";
import { createHash } from "crypto";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { extractTenderFromText } from "@/lib/ai/gemini";
import { db } from "@/lib/db";
import { tenderTable } from "@/lib/db/schema";
import { ilike, or } from "drizzle-orm";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Compute a short SHA-256 hash (first 16 hex chars) from the raw PDF bytes.
 * This gives us content-based duplicate detection regardless of filename.
 */
function computeFileHash(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}

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

    const rawFileName = file.name;
    const baseFileName = rawFileName.replace(/\.pdf$/i, "");
    const sanitizedName = baseFileName.replace(/[^a-zA-Z0-9_.-]/g, "_");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compute content hash from the raw PDF bytes for duplicate detection (before expensive AI work)
    const contentHash = computeFileHash(buffer);

    // Check if a PDF with the same content hash OR same filename already exists in the database
    const existingDoc = await db
      .select({ id: tenderTable.id, title: tenderTable.title })
      .from(tenderTable)
      .where(
        or(
          // Content-based: check if hash appears in any existing document URL
          ilike(tenderTable.documentUrl, `%_${contentHash}%`),
          // Filename-based: fallback check by name patterns
          ilike(tenderTable.documentUrl, `%/${sanitizedName}.pdf`),
          ilike(tenderTable.documentUrl, `%/${baseFileName}.pdf`),
          ilike(tenderTable.documentUrl, `%/${rawFileName}`)
        )
      )
      .limit(1);

    if (existingDoc.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `This PDF has already been uploaded for tender "${existingDoc[0].title || existingDoc[0].id}". Duplicate PDF documents are not allowed — even with a different filename.`,
        },
        { status: 409 }
      );
    }

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
      console.error("SERVER ERROR [pdfParse]:", pdfErr);
      return NextResponse.json(
        {
          success: false,
          error: "Unable to read PDF file. Please ensure the document is clear and unencrypted.",
        },
        { status: 422 }
      );
    }

    // --- Step 2: Extract structured data using Gemini AI ---
    let extractedData;
    try {
      extractedData = await extractTenderFromText(rawText);
    } catch (aiErr: any) {
      console.error("SERVER ERROR [Gemini AI extraction]:", aiErr);
      return NextResponse.json(
        {
          success: false,
          error: "AI extraction encountered an issue. Please try again or fill in the details manually.",
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

      // Use content hash in the public_id to ensure same content → same ID
      const publicId = `tender_doc_${sanitizedName}_${contentHash}`;

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "rfp_tenders_pdf",
            resource_type: "raw",
            public_id: `${publicId}.pdf`,
            overwrite: false,
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
      // Check if it's a duplicate in Cloudinary storage
      if (
        uploadErr?.http_code === 409 ||
        uploadErr?.message?.includes("already exists") ||
        uploadErr?.message?.includes("Resource already exists")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `This PDF document already exists in storage. Duplicate PDF files are restricted — even with a different filename.`,
          },
          { status: 409 }
        );
      }
      // Non-fatal for other errors: we still have the extracted data even if upload fails
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
    console.error("SERVER ERROR [Extract tender API]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing the document. Please try again.",
      },
      { status: 500 }
    );
  }
}

