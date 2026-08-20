"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  PlusCircle,
  ExternalLink,
  Brain,
  FileSearch,
  Database,
} from "lucide-react";
import { tenderFormSchema, TenderFormData } from "../../new-tender/lib/zod-type/tender-type";
import { useAddTenderMutation } from "../../new-tender/query/mut-add-tender";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExtractionPhase = "idle" | "extracting-text" | "analyzing-ai" | "uploading" | "done" | "error";

interface ExtractedResponse {
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
  documentUrl?: string | null;
}

export function AiExtractForm() {
  const router = useRouter();
  const addTenderMutation = useAddTenderMutation();

  const [phase, setPhase] = useState<ExtractionPhase>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [aiFieldsSet, setAiFieldsSet] = useState<Set<string>>(new Set());

  const form = useForm<TenderFormData>({
    resolver: zodResolver(tenderFormSchema) as any,
    defaultValues: {
      tenderId: "",
      client: "",
      title: "",
      location: "",
      isBidSubmitted: false,
      priority: undefined,
      eligibility: undefined,
      stage: "Draft",
      technicalStatus: "Pending",
      commercialStatus: "Pending",
      emdStatus: "Pending",
      awardStatus: "In Progress",
      documentUrl: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Please select a valid PDF file.");
      return;
    }
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 5 MB limit.`);
      return;
    }
    setSelectedFile(file);
    setPhase("idle");
    setExtractedData(null);
    setErrorMessage("");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleExtract = async () => {
    if (!selectedFile) return;

    setPhase("extracting-text");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Simulate phased progress
      await new Promise((r) => setTimeout(r, 500));
      setPhase("analyzing-ai");

      const res = await fetch("/api/extract-tender", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!result.success) {
        setPhase("error");
        setErrorMessage(result.error || "Extraction failed.");
        toast.error(result.error || "Extraction failed.");
        return;
      }

      setPhase("done");
      const data: ExtractedResponse = result.data;
      setExtractedData(data);

      // Track which fields were filled by AI
      const filledFields = new Set<string>();

      // Pre-fill form with extracted data
      if (data.tenderId) { setValue("tenderId", data.tenderId); filledFields.add("tenderId"); }
      if (data.title) { setValue("title", data.title); filledFields.add("title"); }
      if (data.client) { setValue("client", data.client); filledFields.add("client"); }
      if (data.location) { setValue("location", data.location); filledFields.add("location"); }
      if (data.tenderValue) { setValue("tenderValue", data.tenderValue); filledFields.add("tenderValue"); }
      if (data.emd) { setValue("emd", data.emd); filledFields.add("emd"); }
      if (data.tenderFee) { setValue("tenderFee", data.tenderFee); filledFields.add("tenderFee"); }
      if (data.publishDate) { setValue("publishDate", new Date(data.publishDate)); filledFields.add("publishDate"); }
      if (data.preBidDate) { setValue("preBidDate", new Date(data.preBidDate)); filledFields.add("preBidDate"); }
      if (data.lastDate) { setValue("lastDate", new Date(data.lastDate)); filledFields.add("lastDate"); }
      if (data.openingDate) { setValue("openingDate", new Date(data.openingDate)); filledFields.add("openingDate"); }
      if (data.priority && ["HIGH", "MEDIUM", "LOW"].includes(data.priority)) {
        setValue("priority", data.priority as any); filledFields.add("priority");
      }
      if (data.eligibility && ["ELIGIBLE", "NOT ELIGIBLE"].includes(data.eligibility)) {
        setValue("eligibility", data.eligibility as any); filledFields.add("eligibility");
      }
      if (data.remarks) { setValue("remarks", data.remarks); filledFields.add("remarks"); }
      if (data.documentUrl) { setValue("documentUrl", data.documentUrl); filledFields.add("documentUrl"); }

      // Set reasonable defaults for required date fields if AI couldn't find them
      const today = new Date();
      if (!data.publishDate) setValue("publishDate", today);
      if (!data.preBidDate) setValue("preBidDate", today);
      if (!data.lastDate) setValue("lastDate", today);
      if (!data.openingDate) setValue("openingDate", today);
      if (!data.publishDate || !data.lastDate) {
        setValue("submissionDate", today);
        setValue("expectedResultDate", new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000));
      } else {
        setValue("submissionDate", new Date(data.lastDate));
        const resultDate = new Date(data.lastDate);
        resultDate.setDate(resultDate.getDate() + 60);
        setValue("expectedResultDate", resultDate);
      }

      setAiFieldsSet(filledFields);
      toast.success(`Successfully extracted ${filledFields.size} fields from the tender document!`);
    } catch (err: any) {
      setPhase("error");
      setErrorMessage(err?.message || "Network error during extraction.");
      toast.error(err?.message || "Network error during extraction.");
    }
  };

  const onSubmit = (data: TenderFormData) => {
    addTenderMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Tender created successfully from AI extraction!");
        reset();
        setExtractedData(null);
        setSelectedFile(null);
        setPhase("idle");
        setAiFieldsSet(new Set());
        router.push("/");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to create tender");
      },
    });
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
    setExtractedData(null);
    setPhase("idle");
    setErrorMessage("");
    setAiFieldsSet(new Set());
  };

  const formatDateForInput = (dateVal: Date | undefined) => {
    if (!dateVal) return "";
    return new Date(dateVal).toISOString().split("T")[0];
  };

  const AiBadge = ({ field }: { field: string }) => {
    if (!aiFieldsSet.has(field)) return null;
    return (
      <Badge variant="secondary" className="ml-1.5 gap-1 text-[10px] px-1.5 py-0 h-4 bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800">
        <Sparkles className="size-2.5" />
        AI
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upload & Extract Section */}
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
              <Brain className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">AI-Powered Tender Extraction</CardTitle>
              <CardDescription>
                Upload a tender PDF and let AI automatically extract all the details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-300 cursor-pointer ${
              isDragOver
                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 scale-[1.01]"
                : selectedFile
                ? "border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10"
                : "border-muted-foreground/25 hover:border-amber-400 hover:bg-amber-50/20 dark:hover:bg-amber-950/10"
            }`}
            onClick={() => {
              if (phase !== "extracting-text" && phase !== "analyzing-ai" && phase !== "uploading") {
                document.getElementById("pdf-upload-input")?.click();
              }
            }}
          >
            <input
              id="pdf-upload-input"
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
                e.target.value = "";
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
                  <FileText className="size-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(selectedFile.size / 1024).toFixed(0)} KB • Click to change file
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60">
                  <Upload className="size-7 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Drop your tender PDF here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse • Max 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          {(phase === "extracting-text" || phase === "analyzing-ai" || phase === "uploading") && (() => {
            const p = phase as string;
            return (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`flex size-8 items-center justify-center rounded-full ${
                  p === "extracting-text" ? "bg-amber-100 dark:bg-amber-900/40" : "bg-emerald-100 dark:bg-emerald-900/40"
                }`}>
                  {p === "extracting-text" ? (
                    <Loader2 className="size-4 animate-spin text-amber-600 dark:text-amber-400" />
                  ) : (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Extracting text from PDF</p>
                  <p className="text-xs text-muted-foreground">Reading document content...</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex size-8 items-center justify-center rounded-full ${
                  p === "analyzing-ai"
                    ? "bg-amber-100 dark:bg-amber-900/40"
                    : p === "uploading"
                    ? "bg-emerald-100 dark:bg-emerald-900/40"
                    : "bg-muted"
                }`}>
                  {p === "analyzing-ai" ? (
                    <Loader2 className="size-4 animate-spin text-amber-600 dark:text-amber-400" />
                  ) : p === "uploading" ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <FileSearch className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Analyzing with Gemini AI</p>
                  <p className="text-xs text-muted-foreground">Extracting tender details & dates...</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex size-8 items-center justify-center rounded-full ${
                  p === "uploading"
                    ? "bg-amber-100 dark:bg-amber-900/40"
                    : "bg-muted"
                }`}>
                  {p === "uploading" ? (
                    <Loader2 className="size-4 animate-spin text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Database className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Uploading document</p>
                  <p className="text-xs text-muted-foreground">Storing PDF to cloud...</p>
                </div>
              </div>
            </div>
            );
          })()}

          {/* Error State */}
          {phase === "error" && errorMessage && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <AlertCircle className="size-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Extraction Failed</p>
                <p className="text-xs text-muted-foreground mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Extract Button */}
          {selectedFile && phase !== "done" && (
            <div className="mt-5 flex items-center gap-3">
              <Button
                type="button"
                onClick={handleExtract}
                disabled={phase === "extracting-text" || phase === "analyzing-ai" || phase === "uploading"}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 font-semibold shadow-md"
              >
                {phase === "extracting-text" || phase === "analyzing-ai" || phase === "uploading" ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Extract with AI
                  </>
                )}
              </Button>
              {phase === "error" && (
                <Button variant="outline" size="sm" onClick={() => setPhase("idle")}>
                  Try Again
                </Button>
              )}
            </div>
          )}

          {/* Success Summary */}
          {phase === "done" && extractedData && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Extraction Complete — {aiFieldsSet.size} fields extracted
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Review the pre-filled form below. Fields marked with{" "}
                  <Badge variant="secondary" className="inline-flex gap-0.5 text-[10px] px-1 py-0 h-3.5 bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                    <Sparkles className="size-2" /> AI
                  </Badge>{" "}
                  were automatically extracted. Edit any field before saving.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form - Only shown after extraction */}
      {phase === "done" && extractedData && (
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Review and edit tender details extracted by AI</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tenderId" className="flex items-center">Tender Ref ID <AiBadge field="tenderId" /></Label>
                <Input id="tenderId" {...register("tenderId")} placeholder="e.g. TENDER-2026-001" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client" className="flex items-center">
                  Client / Organization <span className="text-destructive ml-0.5">*</span>
                  <AiBadge field="client" />
                </Label>
                <Input id="client" {...register("client")} placeholder="Issuing organization" />
                {errors.client && <span className="text-xs text-destructive">{errors.client.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="title" className="flex items-center">
                  Tender Title <span className="text-destructive ml-0.5">*</span>
                  <AiBadge field="title" />
                </Label>
                <Input id="title" {...register("title")} placeholder="Full title of the tender" />
                {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="location" className="flex items-center">Location <AiBadge field="location" /></Label>
                <Input id="location" {...register("location")} placeholder="City, State" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="responsiblePerson">Responsible Person</Label>
                <Input id="responsiblePerson" {...register("responsiblePerson")} placeholder="Person in charge" />
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
              <CardDescription>Monetary values extracted from the tender document</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tenderValue" className="flex items-center">Tender Value (₹) <AiBadge field="tenderValue" /></Label>
                <Input id="tenderValue" type="number" {...register("tenderValue")} placeholder="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emd" className="flex items-center">EMD (₹) <AiBadge field="emd" /></Label>
                <Input id="emd" type="number" {...register("emd")} placeholder="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tenderFee" className="flex items-center">Tender Fee (₹) <AiBadge field="tenderFee" /></Label>
                <Input id="tenderFee" type="number" {...register("tenderFee")} placeholder="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ourQuotation">Our Quotation (₹)</Label>
                <Input id="ourQuotation" type="number" {...register("ourQuotation")} placeholder="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expectedMargin">Expected Margin (%)</Label>
                <Input id="expectedMargin" type="number" step="0.01" {...register("expectedMargin")} placeholder="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expectedMarginRupees">Expected Margin (₹)</Label>
                <Input id="expectedMarginRupees" type="number" {...register("expectedMarginRupees")} placeholder="0" />
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
              <CardDescription>Timeline extracted from the tender document</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="publishDate" className="flex items-center">
                  Publish Date <span className="text-destructive ml-0.5">*</span>
                  <AiBadge field="publishDate" />
                </Label>
                <Input
                  id="publishDate" type="date"
                  value={formatDateForInput(watch("publishDate"))}
                  onChange={(e) => setValue("publishDate", e.target.value ? new Date(e.target.value) : undefined as any)}
                />
                {errors.publishDate && <span className="text-xs text-destructive">{errors.publishDate.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="preBidDate" className="flex items-center">
                  Pre-Bid Date <span className="text-destructive ml-0.5">*</span>
                  <AiBadge field="preBidDate" />
                </Label>
                <Input
                  id="preBidDate" type="date"
                  value={formatDateForInput(watch("preBidDate"))}
                  onChange={(e) => setValue("preBidDate", e.target.value ? new Date(e.target.value) : undefined as any)}
                />
                {errors.preBidDate && <span className="text-xs text-destructive">{errors.preBidDate.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastDate" className="flex items-center">
                  Last Date <span className="text-destructive ml-0.5">*</span>
                  <AiBadge field="lastDate" />
                </Label>
                <Input
                  id="lastDate" type="date"
                  value={formatDateForInput(watch("lastDate"))}
                  onChange={(e) => setValue("lastDate", e.target.value ? new Date(e.target.value) : undefined as any)}
                />
                {errors.lastDate && <span className="text-xs text-destructive">{errors.lastDate.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="openingDate" className="flex items-center">
                  Opening Date <span className="text-destructive ml-0.5">*</span>
                  <AiBadge field="openingDate" />
                </Label>
                <Input
                  id="openingDate" type="date"
                  value={formatDateForInput(watch("openingDate"))}
                  onChange={(e) => setValue("openingDate", e.target.value ? new Date(e.target.value) : undefined as any)}
                />
                {errors.openingDate && <span className="text-xs text-destructive">{errors.openingDate.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="submissionDate">
                  Submission Date <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  id="submissionDate" type="date"
                  value={formatDateForInput(watch("submissionDate"))}
                  onChange={(e) => setValue("submissionDate", e.target.value ? new Date(e.target.value) : undefined as any)}
                />
                {errors.submissionDate && <span className="text-xs text-destructive">{errors.submissionDate.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expectedResultDate">
                  Expected Result Date <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  id="expectedResultDate" type="date"
                  value={formatDateForInput(watch("expectedResultDate"))}
                  onChange={(e) => setValue("expectedResultDate", e.target.value ? new Date(e.target.value) : undefined as any)}
                />
                {errors.expectedResultDate && <span className="text-xs text-destructive">{errors.expectedResultDate.message}</span>}
              </div>
            </CardContent>
          </Card>

          {/* Status & Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Classification</CardTitle>
              <CardDescription>Review AI-inferred classification and set statuses</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center">Priority <AiBadge field="priority" /></Label>
                <Select
                  value={watch("priority") || ""}
                  onValueChange={(val) => setValue("priority", val as any)}
                >
                  <SelectTrigger><SelectValue placeholder="Select Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">HIGH</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                    <SelectItem value="LOW">LOW</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center">Eligibility <AiBadge field="eligibility" /></Label>
                <Select
                  value={watch("eligibility") || ""}
                  onValueChange={(val) => setValue("eligibility", val as any)}
                >
                  <SelectTrigger><SelectValue placeholder="Select Eligibility" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELIGIBLE">ELIGIBLE</SelectItem>
                    <SelectItem value="NOT ELIGIBLE">NOT ELIGIBLE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Stage</Label>
                <Select value={watch("stage") || "Draft"} onValueChange={(val) => setValue("stage", val as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Technical Status</Label>
                <Select value={watch("technicalStatus") || "Pending"} onValueChange={(val) => setValue("technicalStatus", val as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Not Qualified">Not Qualified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Commercial Status</Label>
                <Select value={watch("commercialStatus") || "Pending"} onValueChange={(val) => setValue("commercialStatus", val as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Not Qualified">Not Qualified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>EMD Status</Label>
                <Select value={watch("emdStatus") || "Pending"} onValueChange={(val) => setValue("emdStatus", val as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Award Status</Label>
                <Select value={watch("awardStatus") || "In Progress"} onValueChange={(val) => setValue("awardStatus", val as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={watch("isBidSubmitted")}
                  onCheckedChange={(val) => setValue("isBidSubmitted", val)}
                />
                <Label>Bid Submitted</Label>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Partners, competitors, and notes</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="partner">Partner</Label>
                <Input id="partner" {...register("partner")} placeholder="Partner organization" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="competitor">Competitor</Label>
                <Input id="competitor" {...register("competitor")} placeholder="Known competitors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nextAction">Next Action</Label>
                <Input id="nextAction" {...register("nextAction")} placeholder="Next step to take" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nextActionDate">Next Action Date</Label>
                <Input
                  id="nextActionDate" type="date"
                  value={formatDateForInput(watch("nextActionDate") ?? undefined)}
                  onChange={(e) => setValue("nextActionDate", e.target.value ? new Date(e.target.value) : null)}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="remarks" className="flex items-center">Remarks / Notes <AiBadge field="remarks" /></Label>
                <Textarea
                  id="remarks"
                  {...register("remarks")}
                  placeholder="Key highlights and notes..."
                  rows={3}
                />
              </div>

              {/* Document URL */}
              {watch("documentUrl") && (
                <div className="sm:col-span-2 flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                  <FileText className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground truncate flex-1">
                    PDF uploaded to cloud
                  </span>
                  <a
                    href={watch("documentUrl") || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleReset} disabled={addTenderMutation.isPending}>
              <RotateCcw className="mr-2 size-4" />
              Start Over
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 text-amber-950 hover:bg-amber-600 font-semibold"
              disabled={addTenderMutation.isPending}
            >
              {addTenderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving Tender...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 size-4" />
                  Save Tender
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
