"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Save,
  FileText,
  CheckCircle2,
  ExternalLink,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { Tender } from "@/lib/db/schema";
import { tenderFormSchema, TenderFormData } from "../new-tender/lib/zod-type/tender-type";
import { updateTenderAction } from "../lib/action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { format, parseISO } from "date-fns";
import { STATE_DISTRICT_DATA } from "@/lib/state-district";

interface TenderEditDialogProps {
  tender: Tender | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TenderEditDialog({
  tender,
  open,
  onOpenChange,
}: TenderEditDialogProps) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadedPdfInfo, setUploadedPdfInfo] = useState<{
    originalSizeKb: number;
    compressedSizeKb: number;
  } | null>(null);

  const form = useForm<TenderFormData>({
    resolver: zodResolver(tenderFormSchema) as any,
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

  // Initialize form when tender changes
  useEffect(() => {
    if (tender) {
      const safeDate = (d: any) => (d ? new Date(d) : undefined);
      reset({
        tenderId: tender.tenderId || "",
        client: tender.client || "",
        title: tender.title || "",
        state: tender.state || "",
        district: tender.district || "",
        tenderValue: tender.tenderValue ?? undefined,
        emd: tender.emd ?? undefined,
        tenderFee: tender.tenderFee ?? undefined,
        publishDate: safeDate(tender.publishDate),
        preBidDate: safeDate(tender.preBidDate),
        lastDate: safeDate(tender.lastDate),
        openingDate: safeDate(tender.openingDate),
        stage: tender.stage || "",
        priority: (tender.priority as any) || undefined,
        eligibility: (tender.eligibility as any) || undefined,
        technicalStatus: tender.technicalStatus || "",
        commercialStatus: tender.commercialStatus || "",
        emdStatus: tender.emdStatus || "",
        isBidSubmitted: !!tender.isBidSubmitted,
        submissionDate: safeDate(tender.submissionDate),
        expectedResultDate: safeDate(tender.expectedResultDate),
        awardStatus: tender.awardStatus || "",
        competitor: tender.competitor || "",
        ourQuotation: tender.ourQuotation ?? undefined,
        expectedMargin: tender.expectedMargin ?? undefined,
        expectedMarginRupees: tender.expectedMarginRupees ?? undefined,
        responsiblePerson: tender.responsiblePerson || "",
        partner: tender.partner || "",
        nextAction: tender.nextAction || "",
        nextActionDate: safeDate(tender.nextActionDate),
        remarks: tender.remarks || "",
        documentUrl: tender.documentUrl || "",
      });
      setUploadedPdfInfo(null);
    }
  }, [tender, reset]);

  if (!tender) return null;

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
        )} MB) exceeds 2MB limit.`
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
          `PDF updated & compressed successfully (${result.originalSizeKb} KB → ${result.compressedSizeKb} KB)!`
        );
      } else {
        toast.error(result.error || "Failed to upload PDF document.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error uploading PDF document.");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const onSubmit = async (data: TenderFormData) => {
    setIsSaving(true);
    try {
      const res = await updateTenderAction(tender.id, data);
      if (res.success) {
        toast.success("Tender updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["tenders"] });
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to update tender");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateForInput = (dateVal: Date | undefined) => {
    if (!dateVal || isNaN(new Date(dateVal).getTime())) return "";
    return format(new Date(dateVal), "yyyy-MM-dd");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-5xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <Pencil className="size-5 text-primary" />
            <DialogTitle className="text-xl font-bold">Edit Tender Details</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Update specifications, financial estimates, deadlines, and submission status for Ref ID:{" "}
            <span className="font-mono font-semibold text-foreground">{tender.tenderId || tender.id}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 pt-2">
          {/* Basic Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
              <CardDescription className="text-xs">General tender and client details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tender Title *</Label>
                <Input id="edit-title" placeholder="Tender title" {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-client">Client Name *</Label>
                <Input id="edit-client" placeholder="Client name" {...register("client")} />
                {errors.client && <p className="text-xs text-destructive">{errors.client.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tenderId">Tender Reference ID</Label>
                <Input id="edit-tenderId" placeholder="Tender Ref ID" {...register("tenderId")} />
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

          {/* Document PDF Upload Card */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    Tender Document (PDF)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Upload or replace official tender PDF document (Max 2MB, auto-compressed)
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
                  <Label htmlFor="edit-pdfFile">Upload / Replace PDF File (Max 2MB)</Label>
                  <Input
                    id="edit-pdfFile"
                    type="file"
                    accept="application/pdf"
                    disabled={isUploadingPdf}
                    onChange={handlePdfUpload}
                    className="cursor-pointer bg-background"
                  />
                </div>

                {isUploadingPdf && (
                  <div className="flex items-center gap-2 text-xs font-medium text-primary animate-pulse pt-4">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Compressing & uploading PDF document...</span>
                  </div>
                )}

                {watch("documentUrl") && !isUploadingPdf && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                    <div className="text-xs space-y-0.5">
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <FileText className="size-3.5 text-red-600" />
                        PDF Document Ready
                      </p>
                      {uploadedPdfInfo && (
                        <p className="text-muted-foreground">
                          {uploadedPdfInfo.originalSizeKb} KB →{" "}
                          <strong className="text-emerald-600 font-bold">
                            {uploadedPdfInfo.compressedSizeKb} KB
                          </strong>
                        </p>
                      )}
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Financial Information</CardTitle>
              <CardDescription className="text-xs">Tender value, EMD amount, fee, and quotation</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-tenderValue">Tender Value (₹)</Label>
                <Input id="edit-tenderValue" type="number" placeholder="5000000" {...register("tenderValue")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-emd">EMD Amount (₹)</Label>
                <Input id="edit-emd" type="number" placeholder="100000" {...register("emd")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tenderFee">Tender Fee (₹)</Label>
                <Input id="edit-tenderFee" type="number" placeholder="5000" {...register("tenderFee")} />
              </div>
            </CardContent>
          </Card>

          {/* Key Dates Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Important Dates</CardTitle>
              <CardDescription className="text-xs">Key tender dates (Format: DD/MM/YYYY)</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-publishDate">Publish Date *</Label>
                <Input
                  id="edit-publishDate"
                  type="date"
                  value={formatDateForInput(watch("publishDate"))}
                  onChange={(e) => setValue("publishDate", e.target.value ? new Date(e.target.value) : (undefined as any))}
                />
                {watch("publishDate") && !isNaN(new Date(watch("publishDate")).getTime()) && (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Format (DD/MM/YYYY): {format(new Date(watch("publishDate")), "dd/MM/yyyy")}
                  </p>
                )}
                {errors.publishDate && <p className="text-xs text-destructive">{errors.publishDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-preBidDate">Pre-Bid Date *</Label>
                <Input
                  id="edit-preBidDate"
                  type="date"
                  value={formatDateForInput(watch("preBidDate"))}
                  onChange={(e) => setValue("preBidDate", e.target.value ? new Date(e.target.value) : (undefined as any))}
                />
                {watch("preBidDate") && !isNaN(new Date(watch("preBidDate")).getTime()) && (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Format (DD/MM/YYYY): {format(new Date(watch("preBidDate")), "dd/MM/yyyy")}
                  </p>
                )}
                {errors.preBidDate && <p className="text-xs text-destructive">{errors.preBidDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-lastDate">Last Date of Submission *</Label>
                <Input
                  id="edit-lastDate"
                  type="date"
                  value={formatDateForInput(watch("lastDate"))}
                  onChange={(e) => setValue("lastDate", e.target.value ? new Date(e.target.value) : (undefined as any))}
                />
                {watch("lastDate") && !isNaN(new Date(watch("lastDate")).getTime()) && (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Format (DD/MM/YYYY): {format(new Date(watch("lastDate")), "dd/MM/yyyy")}
                  </p>
                )}
                {errors.lastDate && <p className="text-xs text-destructive">{errors.lastDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-openingDate">Opening Date *</Label>
                <Input
                  id="edit-openingDate"
                  type="date"
                  value={formatDateForInput(watch("openingDate"))}
                  onChange={(e) => setValue("openingDate", e.target.value ? new Date(e.target.value) : (undefined as any))}
                />
                {watch("openingDate") && !isNaN(new Date(watch("openingDate")).getTime()) && (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Format (DD/MM/YYYY): {format(new Date(watch("openingDate")), "dd/MM/yyyy")}
                  </p>
                )}
                {errors.openingDate && <p className="text-xs text-destructive">{errors.openingDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-submissionDate">Actual Submission Date *</Label>
                <Input
                  id="edit-submissionDate"
                  type="date"
                  value={formatDateForInput(watch("submissionDate"))}
                  onChange={(e) => setValue("submissionDate", e.target.value ? new Date(e.target.value) : (undefined as any))}
                />
                {watch("submissionDate") && !isNaN(new Date(watch("submissionDate")).getTime()) && (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Format (DD/MM/YYYY): {format(new Date(watch("submissionDate")), "dd/MM/yyyy")}
                  </p>
                )}
                {errors.submissionDate && <p className="text-xs text-destructive">{errors.submissionDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expectedResultDate">Expected Result Date *</Label>
                <Input
                  id="edit-expectedResultDate"
                  type="date"
                  value={formatDateForInput(watch("expectedResultDate"))}
                  onChange={(e) => setValue("expectedResultDate", e.target.value ? new Date(e.target.value) : (undefined as any))}
                />
                {watch("expectedResultDate") && !isNaN(new Date(watch("expectedResultDate")).getTime()) && (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Format (DD/MM/YYYY): {format(new Date(watch("expectedResultDate")), "dd/MM/yyyy")}
                  </p>
                )}
                {errors.expectedResultDate && <p className="text-xs text-destructive">{errors.expectedResultDate.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Evaluation & Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Evaluation & Status</CardTitle>
              <CardDescription className="text-xs">Priority, eligibility, and stage tracking</CardDescription>
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
                <Label htmlFor="edit-stage">Current Stage</Label>
                <Input id="edit-stage" placeholder="e.g. Technical Evaluation" {...register("stage")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-technicalStatus">Technical Status</Label>
                <Input id="edit-technicalStatus" placeholder="Technical status" {...register("technicalStatus")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-commercialStatus">Commercial Status</Label>
                <Input id="edit-commercialStatus" placeholder="Commercial status" {...register("commercialStatus")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-emdStatus">EMD Status</Label>
                <Input id="edit-emdStatus" placeholder="EMD status" {...register("emdStatus")} />
              </div>
            </CardContent>
          </Card>

          {/* Bid Submission & Commercials */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Bid & Commercials</CardTitle>
              <CardDescription className="text-xs">Quotation and margin breakdown</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center space-x-3 pt-6">
                <Switch
                  id="edit-isBidSubmitted"
                  checked={watch("isBidSubmitted")}
                  onCheckedChange={(checked) => setValue("isBidSubmitted", checked)}
                />
                <Label htmlFor="edit-isBidSubmitted" className="cursor-pointer font-medium">
                  Bid Submitted
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ourQuotation">Our Quotation (₹)</Label>
                <Input id="edit-ourQuotation" type="number" placeholder="4800000" {...register("ourQuotation")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expectedMargin">Expected Margin (%)</Label>
                <Input id="edit-expectedMargin" type="number" step="0.1" placeholder="12.5" {...register("expectedMargin")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expectedMarginRupees">Expected Margin (₹)</Label>
                <Input id="edit-expectedMarginRupees" type="number" placeholder="600000" {...register("expectedMarginRupees")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-awardStatus">Award Status</Label>
                <Input id="edit-awardStatus" placeholder="Award status" {...register("awardStatus")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-competitor">Main Competitor</Label>
                <Input id="edit-competitor" placeholder="Competitor name" {...register("competitor")} />
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Remarks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Assignment & Remarks</CardTitle>
              <CardDescription className="text-xs">Responsible personnel and follow-ups</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-responsiblePerson">Responsible Person</Label>
                <Input id="edit-responsiblePerson" placeholder="Person name" {...register("responsiblePerson")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-partner">Partner Company</Label>
                <Input id="edit-partner" placeholder="Partner company" {...register("partner")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nextAction">Next Action</Label>
                <Input id="edit-nextAction" placeholder="Next action task" {...register("nextAction")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nextActionDate">Next Action Date</Label>
                <Input
                  id="edit-nextActionDate"
                  type="date"
                  value={formatDateForInput(watch("nextActionDate") ?? undefined)}
                  onChange={(e) => setValue("nextActionDate", e.target.value ? new Date(e.target.value) : null)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-remarks">Remarks / Notes</Label>
                <Textarea id="edit-remarks" rows={3} placeholder="Additional comments..." {...register("remarks")} />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isUploadingPdf}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isUploadingPdf} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
