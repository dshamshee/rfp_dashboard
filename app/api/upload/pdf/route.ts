import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PDFDocument } from "pdf-lib";

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

    const arrayBuffer = await file.arrayBuffer();
    const initialBuffer = Buffer.from(arrayBuffer);

    let finalBuffer: Buffer = initialBuffer;
    let compressedBytes: Uint8Array;

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
      compressedBytes = await pdfDoc.save({ useObjectStreams: true });
      finalBuffer = Buffer.from(compressedBytes);
    } catch (pdfErr) {
      console.warn("pdf-lib compression fallback, using original buffer:", pdfErr);
      finalBuffer = initialBuffer;
    }

    // Upload compressed PDF buffer to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "rfp_tenders_pdf",
          resource_type: "raw",
          public_id: `tender_doc_${Date.now()}`,
          format: "pdf",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(finalBuffer);
    });

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
