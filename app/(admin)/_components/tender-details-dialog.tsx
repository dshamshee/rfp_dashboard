"use client";

import { useState } from "react";
import { Tender } from "@/lib/db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Calendar,
  Clock,
  Copy,
  FileText,
  IndianRupee,
  MapPin,
  Tag,
  User,
  TrendingUp,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { TenderEditDialog } from "./tender-edit-dialog";

interface TenderDetailsDialogProps {
  tender: Tender | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (val: number | null | undefined) => {
  if (val == null) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (dateVal: Date | string | null | undefined) => {
  if (!dateVal) return "-";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "-";
  return format(d, "dd/MM/yyyy");
};

export function TenderDetailsDialog({
  tender,
  open,
  onOpenChange,
}: TenderDetailsDialogProps) {
  const [showEdit, setShowEdit] = useState(false);

  if (!tender) return null;

  const handleCopyId = () => {
    if (tender.tenderId) {
      navigator.clipboard.writeText(tender.tenderId);
      toast.success("Tender Ref ID copied to clipboard");
    }
  };

  const priorityVariantMap: Record<string, "destructive" | "default" | "secondary"> = {
    HIGH: "destructive",
    MEDIUM: "default",
    LOW: "secondary",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl sm:max-w-5xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader className="gap-2 border-b pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-1">
                  Ref ID: {tender.tenderId || tender.id}
                </Badge>
                {tender.tenderId && (
                  <Button variant="ghost" size="icon-sm" onClick={handleCopyId} title="Copy ID">
                    <Copy className="size-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {tender.priority && (
                  <Badge variant={priorityVariantMap[tender.priority] || "secondary"}>
                    {tender.priority} Priority
                  </Badge>
                )}
                {tender.eligibility && (
                  <Badge
                    className={
                      tender.eligibility === "ELIGIBLE"
                        ? "bg-emerald-600 text-white"
                        : "bg-rose-600 text-white"
                    }
                  >
                    {tender.eligibility}
                  </Badge>
                )}
                <Badge variant={tender.isBidSubmitted ? "default" : "secondary"}>
                  {tender.isBidSubmitted ? "Submitted" : "Not Submitted"}
                </Badge>

                {/* Edit Tender Button in View Card Header */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEdit(true)}
                  className="gap-1.5 font-semibold text-xs ml-1 border-primary/40 hover:bg-primary/10"
                >
                  <Pencil className="size-3.5 text-primary" />
                  Edit Tender
                </Button>
              </div>
            </div>

            <DialogTitle className="text-2xl font-bold leading-snug text-foreground pt-1">
              {tender.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="size-4 text-primary" />
              <span className="font-medium text-foreground">{tender.client}</span>
              {(tender.district || tender.state) && (
                <>
                  <span>•</span>
                  <MapPin className="size-3.5" />
                  <span>{[tender.district, tender.state].filter(Boolean).join(", ")}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* View PDF Document Banner/Button */}
            {tender.documentUrl && (
              <div className="flex items-center justify-between p-4 rounded-xl border bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Official Tender PDF Document</p>
                    <p className="text-xs text-muted-foreground">Uploaded & Compressed RFP File</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.open(tender.documentUrl || "", "_blank")}
                  className="gap-1.5 font-semibold"
                >
                  <ExternalLink className="size-3.5" />
                  View PDF Document
                </Button>
              </div>
            )}

            {/* Key Financial Summary */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <IndianRupee className="size-4 text-emerald-600" />
                Financial Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/30 p-5 rounded-xl border">
                <div>
                  <p className="text-xs text-muted-foreground">Tender Value</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(tender.tenderValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">EMD Amount</p>
                  <p className="text-base font-semibold text-foreground">
                    {formatCurrency(tender.emd)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tender Fee</p>
                  <p className="text-base font-semibold text-foreground">
                    {formatCurrency(tender.tenderFee)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Our Quotation</p>
                  <p className="text-base font-semibold text-foreground">
                    {formatCurrency(tender.ourQuotation)}
                  </p>
                </div>
              </div>

              {(tender.expectedMargin != null || tender.expectedMarginRupees != null) && (
                <div className="mt-3 flex items-center gap-4 text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900">
                  <TrendingUp className="size-4 text-emerald-600" />
                  <span>
                    <strong>Expected Margin:</strong>{" "}
                    {tender.expectedMargin != null ? `${tender.expectedMargin}%` : ""}{" "}
                    {tender.expectedMarginRupees != null ? `(${formatCurrency(tender.expectedMarginRupees)})` : ""}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Dates & Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Calendar className="size-4 text-primary" />
                Key Dates & Timeline (DD/MM/YYYY)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Publish Date</p>
                  <p className="text-sm font-semibold text-foreground font-mono">{formatDate(tender.publishDate)}</p>
                </div>
                <div className="p-3.5 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Pre-Bid Meeting Date</p>
                  <p className="text-sm font-semibold text-foreground font-mono">{formatDate(tender.preBidDate)}</p>
                </div>
                <div className="p-3.5 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Last Submission Date</p>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {formatDate(tender.lastDate)}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Opening Date</p>
                  <p className="text-sm font-semibold text-foreground font-mono">{formatDate(tender.openingDate)}</p>
                </div>
                <div className="p-3.5 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Submission Date</p>
                  <p className="text-sm font-semibold text-foreground font-mono">{formatDate(tender.submissionDate)}</p>
                </div>
                <div className="p-3.5 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Expected Result Date</p>
                  <p className="text-sm font-semibold text-foreground font-mono">{formatDate(tender.expectedResultDate)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Status & Assignments */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Tag className="size-4 text-primary" />
                Status & Assignment Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground">Owner / Responsible</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <User className="size-3.5 text-muted-foreground" />
                    {tender.responsiblePerson || "-"}
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground">Partner</p>
                  <p className="text-sm font-semibold text-foreground">{tender.partner || "-"}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground">Stage</p>
                  <p className="text-sm font-semibold text-foreground">{tender.stage || "-"}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground">Technical Status</p>
                  <p className="text-sm font-semibold text-foreground">{tender.technicalStatus || "-"}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground">Commercial Status</p>
                  <p className="text-sm font-semibold text-foreground">{tender.commercialStatus || "-"}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground">EMD Status</p>
                  <p className="text-sm font-semibold text-foreground">{tender.emdStatus || "-"}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground">Award Status</p>
                  <p className="text-sm font-semibold text-foreground">{tender.awardStatus || "-"}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground">Competitor</p>
                  <p className="text-sm font-semibold text-foreground">{tender.competitor || "-"}</p>
                </div>
              </div>
            </div>

            {/* Next Action & Remarks */}
            {(tender.nextAction || tender.remarks) && (
              <>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tender.nextAction && (
                    <div className="p-4 rounded-lg border bg-amber-500/5 border-amber-500/20">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        Next Action
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">{tender.nextAction}</p>
                      {tender.nextActionDate && (
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          Due: {formatDate(tender.nextActionDate)}
                        </p>
                      )}
                    </div>
                  )}

                  {tender.remarks && (
                    <div className="p-4 rounded-lg border bg-card">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        Remarks
                      </p>
                      <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{tender.remarks}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tender Modal */}
      <TenderEditDialog
        tender={tender}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
    </>
  );
}

