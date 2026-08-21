"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  PlusCircle,
  RotateCcw,
  FileText,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { tenderFormSchema, TenderFormData } from "../lib/zod-type/tender-type";
import { useAddTenderMutation } from "../query/mut-add-tender";
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

import { STATE_DISTRICT_DATA } from "@/lib/state-district";

export function TenderForm() {
  const router = useRouter();
  const addTenderMutation = useAddTenderMutation();

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadedPdfInfo, setUploadedPdfInfo] = useState<{
    originalSizeKb: number;
    compressedSizeKb: number;
  } | null>(null);

  const form = useForm<TenderFormData>({
    resolver: zodResolver(tenderFormSchema) as any,
    defaultValues: {
      tenderId: "",
      client: "",
      title: "",
      state: "",
      district: "",
      isBidSubmitted: false,
      priority: undefined,
      eligibility: undefined,
      stage: "Draft",
      technicalStatus: "Pending",
      commercialStatus: "Pending",
      emdStatus: "Pending",
      awardStatus: "In Progress",
      documentUrl: "",
      insertedBy: "MANUAL",
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

  const selectedState = (watch("state") || "") as string;
  const selectedDistrict = (watch("district") || "") as string;
  const districtOptions =
    STATE_DISTRICT_DATA.states.find((s) => s.state === selectedState)?.districts || [];

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Invalid file type. Please select a valid PDF document.");
      e.target.value = "";
      return;
    }

    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB limit
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(
        `Selected PDF (${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB) exceeds 2MB limit. Please select a file up to 2MB.`
      );
      e.target.value = "";
      return;
    }

    setIsUploadingPdf(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success && result.url) {
        setValue("documentUrl", result.url);
        setUploadedPdfInfo({
          originalSizeKb: result.originalSizeKb,
          compressedSizeKb: result.compressedSizeKb,
        });
        toast.success(
          `PDF uploaded & compressed successfully (${result.originalSizeKb} KB → ${result.compressedSizeKb} KB)!`
        );
      } else {
        toast.error(result.error || "Failed to upload PDF document. Please try again.");
      }
    } catch (err: any) {
      console.error("PDF upload client error:", err);
      toast.error("Failed to upload PDF document. Please try again.");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const onSubmit = (data: TenderFormData) => {
    addTenderMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Tender created successfully!");
        reset();
        setUploadedPdfInfo(null);
        router.push("/");
      },
      onError: (err: any) => {
        console.error("Create tender client error:", err);
        toast.error("Failed to create tender. Please check your inputs and try again.");
      },
    });
  };

  const formatDateForInput = (dateVal: Date | undefined) => {
    if (!dateVal) return "";
    return new Date(dateVal).toISOString().split("T")[0];
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      {/* Basic Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter general details about the tender and client</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Tender Title *</Label>
            <Input id="title" placeholder="e.g. Supply & Installation of Hardware" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Client Name *</Label>
            <Input id="client" placeholder="e.g. PWD Maharashtra" {...register("client")} />
            {errors.client && <p className="text-xs text-destructive">{errors.client.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenderId">Tender Reference ID</Label>
            <Input id="tenderId" placeholder="e.g. TND/2026/001" {...register("tenderId")} />
          </div>

          <div className="space-y-2">
            <Label>State</Label>
            <Select
              value={selectedState}
              onValueChange={(val) => {
                setValue("state", val as any);
                setValue("district", "" as any);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {STATE_DISTRICT_DATA.states.map((s) => (
                  <SelectItem key={s.state} value={s.state}>
                    {s.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>District</Label>
            <Select
              value={selectedDistrict}
              onValueChange={(val) => setValue("district", val as any)}
              disabled={!selectedState}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedState ? "Select District" : "Select State first"} />
              </SelectTrigger>
              <SelectContent>
                {districtOptions.map((dist) => (
                  <SelectItem key={dist} value={dist}>
                    {dist}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tender Document PDF Upload Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                Tender Document (PDF)
              </CardTitle>
              <CardDescription>
                Upload official tender RFP document (PDF format, max 2MB limit, auto-compressed on backend)
              </CardDescription>
            </div>
            {watch("documentUrl") && (
              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="mr-1 size-3.5" /> PDF Attached
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 items-center">
            <div className="space-y-2">
              <Label htmlFor="pdfFile">Select PDF File (Max 2MB)</Label>
              <Input
                id="pdfFile"
                type="file"
                accept="application/pdf"
                disabled={isUploadingPdf}
                onChange={handlePdfUpload}
                className="cursor-pointer bg-background"
              />
            </div>

            {isUploadingPdf && (
              <div className="flex items-center gap-2 text-xs font-medium text-primary animate-pulse pt-6">
                <Loader2 className="size-4 animate-spin" />
                <span>Compressing PDF to ~50KB & uploading to Cloudinary...</span>
              </div>
            )}

            {uploadedPdfInfo && !isUploadingPdf && watch("documentUrl") && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <FileText className="size-3.5 text-red-600" />
                    Compressed PDF Attached
                  </p>
                  <p className="text-muted-foreground">
                    Original: {uploadedPdfInfo.originalSizeKb} KB → Compressed:{" "}
                    <strong className="text-emerald-600 font-bold">
                      {uploadedPdfInfo.compressedSizeKb} KB
                    </strong>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(watch("documentUrl") || "", "_blank")}
                  className="h-8 text-xs gap-1"
                >
                  <ExternalLink className="size-3.5" />
                  View PDF
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
          <CardDescription>Amounts related to tender value, EMD, and fees</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="tenderValue">Tender Value (₹)</Label>
            <Input id="tenderValue" type="number" placeholder="5000000" {...register("tenderValue")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emd">EMD Amount (₹)</Label>
            <Input id="emd" type="number" placeholder="100000" {...register("emd")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenderFee">Tender Fee (₹)</Label>
            <Input id="tenderFee" type="number" placeholder="5000" {...register("tenderFee")} />
          </div>
        </CardContent>
      </Card>

      {/* Key Dates Card */}
      <Card>
        <CardHeader>
          <CardTitle>Important Dates</CardTitle>
          <CardDescription>Timeline of tender milestones</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="publishDate">Publish Date *</Label>
            <Input
              id="publishDate"
              type="date"
              value={formatDateForInput(watch("publishDate"))}
              onChange={(e) => setValue("publishDate", new Date(e.target.value))}
            />
            {errors.publishDate && <p className="text-xs text-destructive">{errors.publishDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preBidDate">Pre-Bid Date *</Label>
            <Input
              id="preBidDate"
              type="date"
              value={formatDateForInput(watch("preBidDate"))}
              onChange={(e) => setValue("preBidDate", new Date(e.target.value))}
            />
            {errors.preBidDate && <p className="text-xs text-destructive">{errors.preBidDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastDate">Last Date of Submission *</Label>
            <Input
              id="lastDate"
              type="date"
              value={formatDateForInput(watch("lastDate"))}
              onChange={(e) => setValue("lastDate", new Date(e.target.value))}
            />
            {errors.lastDate && <p className="text-xs text-destructive">{errors.lastDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="openingDate">Opening Date *</Label>
            <Input
              id="openingDate"
              type="date"
              value={formatDateForInput(watch("openingDate"))}
              onChange={(e) => setValue("openingDate", new Date(e.target.value))}
            />
            {errors.openingDate && <p className="text-xs text-destructive">{errors.openingDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="submissionDate">Actual Submission Date *</Label>
            <Input
              id="submissionDate"
              type="date"
              value={formatDateForInput(watch("submissionDate"))}
              onChange={(e) => setValue("submissionDate", new Date(e.target.value))}
            />
            {errors.submissionDate && <p className="text-xs text-destructive">{errors.submissionDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedResultDate">Expected Result Date *</Label>
            <Input
              id="expectedResultDate"
              type="date"
              value={formatDateForInput(watch("expectedResultDate"))}
              onChange={(e) => setValue("expectedResultDate", new Date(e.target.value))}
            />
            {errors.expectedResultDate && <p className="text-xs text-destructive">{errors.expectedResultDate.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Evaluation & Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation & Status</CardTitle>
          <CardDescription>Priority, eligibility, and stage tracking</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={watch("priority") || ""}
              onValueChange={(val) => setValue("priority", val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Eligibility</Label>
            <Select
              value={watch("eligibility") || ""}
              onValueChange={(val) => setValue("eligibility", val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Eligibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ELIGIBLE">ELIGIBLE</SelectItem>
                <SelectItem value="NOT ELIGIBLE">NOT ELIGIBLE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Current Stage</Label>
            <Input id="stage" placeholder="e.g. Technical Evaluation" {...register("stage")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technicalStatus">Technical Status</Label>
            <Input id="technicalStatus" placeholder="e.g. Qualified" {...register("technicalStatus")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commercialStatus">Commercial Status</Label>
            <Input id="commercialStatus" placeholder="e.g. L1 Bidder" {...register("commercialStatus")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emdStatus">EMD Status</Label>
            <Input id="emdStatus" placeholder="e.g. Deposited / Exempted" {...register("emdStatus")} />
          </div>
        </CardContent>
      </Card>

      {/* Bid Submission & Quotation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bid & Commercials</CardTitle>
          <CardDescription>Our quotation and margin details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center space-x-3 pt-6">
            <Switch
              id="isBidSubmitted"
              checked={watch("isBidSubmitted")}
              onCheckedChange={(checked) => setValue("isBidSubmitted", checked)}
            />
            <Label htmlFor="isBidSubmitted" className="cursor-pointer font-medium">
              Bid Submitted
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ourQuotation">Our Quotation (₹)</Label>
            <Input id="ourQuotation" type="number" placeholder="4800000" {...register("ourQuotation")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedMargin">Expected Margin (%)</Label>
            <Input id="expectedMargin" type="number" step="0.1" placeholder="12.5" {...register("expectedMargin")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedMarginRupees">Expected Margin (₹)</Label>
            <Input id="expectedMarginRupees" type="number" placeholder="600000" {...register("expectedMarginRupees")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="awardStatus">Award Status</Label>
            <Input id="awardStatus" placeholder="e.g. Awarded / Under Review" {...register("awardStatus")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="competitor">Main Competitor</Label>
            <Input id="competitor" placeholder="e.g. ABC Technologies" {...register("competitor")} />
          </div>
        </CardContent>
      </Card>

      {/* Ownership & Remarks Card */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment & Remarks</CardTitle>
          <CardDescription>Responsible personnel and next action follow-up</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="responsiblePerson">Responsible Person</Label>
            <Input id="responsiblePerson" placeholder="e.g. John Doe" {...register("responsiblePerson")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner">Partner Company</Label>
            <Input id="partner" placeholder="e.g. XYZ Solutions" {...register("partner")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextAction">Next Action</Label>
            <Input id="nextAction" placeholder="e.g. Submit Bank Guarantee" {...register("nextAction")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextActionDate">Next Action Date</Label>
            <Input
              id="nextActionDate"
              type="date"
              value={formatDateForInput(watch("nextActionDate") ?? undefined)}
              onChange={(e) => setValue("nextActionDate", e.target.value ? new Date(e.target.value) : null)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="remarks">Remarks / Notes</Label>
            <Textarea id="remarks" rows={3} placeholder="Additional details or instructions..." {...register("remarks")} />
          </div>
        </CardContent>
      </Card>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => reset()} disabled={addTenderMutation.isPending || isUploadingPdf}>
          <RotateCcw className="mr-2 size-4" />
          Reset Form
        </Button>
        <Button type="submit" disabled={addTenderMutation.isPending || isUploadingPdf}>
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
  );
}
