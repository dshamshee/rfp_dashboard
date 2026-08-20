declare module "pdf-parse/lib/pdf-parse.js" {
  interface PDFParseOptions {
    pagerender?: (pageData: any) => string;
    max?: number;
    version?: string;
  }

  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: PDFParseOptions): Promise<PDFParseResult>;

  export default pdfParse;
}
