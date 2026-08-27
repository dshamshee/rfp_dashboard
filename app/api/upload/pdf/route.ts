import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PDFDocument } from "pdf-lib";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { tenderTable } from "@/lib/db/schema";
import { ilike, or, isNotNull } from "drizzle-orm";

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

    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB limit
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(file.size / (1024 * 1024)).toFixed(
            2
          )} MB) exceeds the maximum allowed 2 MB limit. Please select a smaller PDF.`,
        },
        { status: 400 }
      );
    }

    const rawFileName = file.name;
    const baseFileName = rawFileName.replace(/\.pdf$/i, "");
    const sanitizedName = baseFileName.replace(/[^a-zA-Z0-9_.-]/g, "_");

    const arrayBuffer = await file.arrayBuffer();
    const initialBuffer = Buffer.from(arrayBuffer);

    // Compute content hash from the raw PDF bytes for duplicate detection
    const contentHash = computeFileHash(initialBuffer);

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

    let finalBuffer: Buffer = initialBuffer;

    try {
      // Load PDF and strip bloated metadata & compress streams
      const pdfDoc = await PDFDocument.load(initialBuffer, { ignoreEncryption: true });

      // Reset metadata to reduce overhead
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer("RFP Dashboard PDF Optimizer");
      pdfDoc.setCreator("RFP Dashboard");

      // Save compressed PDF using object streams
      const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
      finalBuffer = Buffer.from(compressedBytes);
    } catch (pdfErr) {
      console.warn("pdf-lib compression fallback, using original buffer:", pdfErr);
      finalBuffer = initialBuffer;
    }

    // Use content hash in the public_id to ensure same content → same ID
    const publicId = `${sanitizedName}_${contentHash}`;

    // Upload compressed PDF buffer to Cloudinary
    let uploadResult: any;
    try {
      uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "rfp_tenders_pdf",
            resource_type: "raw",
            public_id: `${publicId}.pdf`,
            overwrite: false,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(finalBuffer);
      });
    } catch (uploadErr: any) {
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
      throw uploadErr;
    }

    const originalSizeKb = Math.round(file.size / 1024);
    const compressedSizeKb = Math.round(finalBuffer.length / 1024);

    return NextResponse.json(
      {
        success: true,
        message: "PDF uploaded successfully",
        url: uploadResult.secure_url,
        originalSizeKb,
        compressedSizeKb,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("SERVER ERROR [PDF upload]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload document. Please try again.",
      },
      { status: 500 }
    );
  }
}
