"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, PlusCircle, Building2, FileText, CalendarIcon, MessageSquare, Cpu } from "lucide-react";
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
import { useAddIncomingBidMutation } from "../query/mut-incoming-bid";

interface AddIncomingBidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddIncomingBidDialog({ open, onOpenChange }: AddIncomingBidDialogProps) {
  const addMutation = useAddIncomingBidMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IncomingBidFormData>({
    resolver: zodResolver(incomingBidFormSchema) as any,
    defaultValues: {
      Department: "",
      bidDetails: "",
      oemDetails: "",
      remarks: "",
    },
  });

  const formatDateForInput = (dateVal: Date | undefined) => {
    if (!dateVal) return "";
    return new Date(dateVal).toISOString().split("T")[0];
  };

  const onSubmit = (data: IncomingBidFormData) => {
    addMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Incoming bid added successfully!");
        reset();
        onOpenChange(false);
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to add incoming bid.");
      },
    });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <PlusCircle className="size-4 text-primary" />
            </div>
            Add Incoming Bid
          </DialogTitle>
          <DialogDescription>
            Record an expected bid that is anticipated to be released soon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5 pt-2">
          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="add-department" className="flex items-center gap-1.5 text-sm font-medium">
              <Building2 className="size-3.5 text-muted-foreground" />
              Department <span className="text-destructive">*</span>
            </Label>
            <Input
              id="add-department"
              placeholder="e.g. Ministry of Defence, PWD Maharashtra"
              {...register("Department")}
            />
            {errors.Department && <p className="text-xs text-destructive">{errors.Department.message}</p>}
          </div>

          {/* Bid Details */}
          <div className="space-y-2">
            <Label htmlFor="add-bidDetails" className="flex items-center gap-1.5 text-sm font-medium">
              <FileText className="size-3.5 text-muted-foreground" />
              Bid Details <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="add-bidDetails"
              rows={3}
              placeholder="Describe the expected bid — scope, category, estimated value, etc."
              {...register("bidDetails")}
            />
            {errors.bidDetails && <p className="text-xs text-destructive">{errors.bidDetails.message}</p>}
          </div>

          {/* OEM Details */}
          <div className="space-y-2">
            <Label htmlFor="add-oemDetails" className="flex items-center gap-1.5 text-sm font-medium">
              <Cpu className="size-3.5 text-muted-foreground" />
              OEM Details <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            <Textarea
              id="add-oemDetails"
              rows={2}
              placeholder="OEM name, product line, or technology stack..."
              {...register("oemDetails")}
            />
          </div>

          {/* Publication Date */}
          <div className="space-y-2">
            <Label htmlFor="add-publicationDate" className="flex items-center gap-1.5 text-sm font-medium">
              <CalendarIcon className="size-3.5 text-muted-foreground" />
              Expected Publication Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="add-publicationDate"
              type="date"
              value={formatDateForInput(watch("publicationDate"))}
              onChange={(e) => setValue("publicationDate", new Date(e.target.value))}
            />
            {errors.publicationDate && <p className="text-xs text-destructive">{errors.publicationDate.message}</p>}
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="add-remarks" className="flex items-center gap-1.5 text-sm font-medium">
              <MessageSquare className="size-3.5 text-muted-foreground" />
              Remarks <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </Label>
            <Textarea
              id="add-remarks"
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
              onClick={handleClose}
              disabled={addMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 size-4" />
                  Add Bid
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
