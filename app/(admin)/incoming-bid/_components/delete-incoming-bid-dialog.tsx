"use client";

import { toast } from "sonner";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteIncomingBidMutation } from "../query/mut-incoming-bid";
import type { IncomingBidRow } from "./incoming-bid-columns";

interface DeleteIncomingBidDialogProps {
  bid: IncomingBidRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteIncomingBidDialog({ bid, open, onOpenChange }: DeleteIncomingBidDialogProps) {
  const deleteMutation = useDeleteIncomingBidMutation();

  const handleDelete = () => {
    if (!bid) return;
    deleteMutation.mutate(bid.id, {
      onSuccess: () => {
        toast.success("Incoming bid deleted successfully.");
        onOpenChange(false);
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to delete incoming bid.");
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-4 text-destructive" />
            </div>
            Delete Incoming Bid
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>Are you sure you want to delete this incoming bid?</span>
            {bid && (
              <span className="block rounded-md border bg-muted/50 p-3 text-sm font-medium text-foreground">
                <span className="text-muted-foreground">Department:</span> {bid.Department}
                <br />
                <span className="text-muted-foreground">Details:</span>{" "}
                {bid.bidDetails.length > 80 ? bid.bidDetails.slice(0, 80) + "..." : bid.bidDetails}
              </span>
            )}
            <span className="block text-xs text-destructive font-medium">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
