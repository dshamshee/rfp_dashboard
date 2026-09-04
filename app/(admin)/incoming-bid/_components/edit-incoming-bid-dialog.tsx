"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save, Building2, FileText, CalendarIcon, MessageSquare, Cpu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { incomingBidFormSchema, IncomingBidFormData } from "../lib/zod-type/incoming-bid-type";
import { useUpdateIncomingBidMutation } from "../query/mut-incoming-bid";
import type { IncomingBidRow } from "./incoming-bid-columns";

interface EditIncomingBidDialogProps {
  bid: IncomingBidRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditIncomingBidDialog({ bid, open, onOpenChange }: EditIncomingBidDialogProps) {
  const updateMutation = useUpdateIncomingBidMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IncomingBidFormData>({
    resolver: zodResolver(incomingBidFormSchema) as any,
  });

  useEffect(() => {
    if (bid && open) {
      reset({
        Department: bid.Department,
        bidDetails: bid.bidDetails,
        oemDetails: bid.oemDetails || "",
        remarks: bid.remarks || "",
        publicationDate: new Date(bid.publicationDate),
      });
    }
  }, [bid, open, reset]);

  const formatDateForInput = (dateVal: Date | undefined) => {
    if (!dateVal) return "";
    return new Date(dateVal).toISOString().split("T")[0];
  };

  const onSubmit = (data: IncomingBidFormData) => {
    if (!bid) return;
    updateMutation.mutate(
      { id: bid.id, data },
      {
        onSuccess: () => {
          toast.success("Incoming bid updated successfully!");
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to update incoming bid.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Save className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            Edit Incoming Bid
          </DialogTitle>
          <DialogDescription>
            Update the details for this incoming bid record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5 pt-2">
          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="edit-department" className="flex items-center gap-1.5 text-sm font-medium">
              <Building2 className="size-3.5 text-muted-foreground" />
              Department <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-department"
              placeholder="e.g. Ministry of Defence, PWD Maharashtra"
              {...register("Department")}
            />
            {errors.Department && <p className="text-xs text-destructive">{errors.Department.message}</p>}
          </div>

          {/* Bid Details */}
          <div className="space-y-2">
            <Label htmlFor="edit-bidDetails" className="flex items-center gap-1.5 text-sm font-medium">
              <FileText className="size-3.5 text-muted-foreground" />
              Bid Details <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="edit-bidDetails"
              rows={3}
              placeholder="Describe the expected bid..."
              {...register("bidDetails")}
            />
            {errors.bidDetails && <p className="text-xs text-destructive">{errors.bidDetails.message}</p>}
          </div>

          {/* OEM Details */}
          <div className="space-y-2">
            <Label htmlFor="edit-oemDetails" className="flex items-center gap-1.5 text-sm font-medium">
              <Cpu className="size-3.5 text-muted-foreground" />
              OEM Details <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            <Textarea
              id="edit-oemDetails"
              rows={2}
              placeholder="OEM name, product line, or technology stack..."
              {...register("oemDetails")}
            />
          </div>

          {/* Publication Date */}
          <div className="space-y-2">
            <Label htmlFor="edit-publicationDate" className="flex items-center gap-1.5 text-sm font-medium">
              <CalendarIcon className="size-3.5 text-muted-foreground" />
              Expected Publication Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-publicationDate"
              type="date"
              value={formatDateForInput(watch("publicationDate"))}
              onChange={(e) => setValue("publicationDate", new Date(e.target.value))}
            />
            {errors.publicationDate && <p className="text-xs text-destructive">{errors.publicationDate.message}</p>}
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="edit-remarks" className="flex items-center gap-1.5 text-sm font-medium">
              <MessageSquare className="size-3.5 text-muted-foreground" />
              Remarks <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            <Textarea
              id="edit-remarks"
              rows={2}
              placeholder="Additional notes or context..."
              {...register("remarks")}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
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
