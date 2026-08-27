"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { addDiscussionAction } from "../lib/action";
import { MessageSquarePlus, Send, Loader2 } from "lucide-react";

interface AddDiscussionDialogProps {
  tenderId: string;
  tenderTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDiscussionDialog({
  tenderId,
  tenderTitle,
  open,
  onOpenChange,
}: AddDiscussionDialogProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error("Please enter a discussion message.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addDiscussionAction(tenderId, trimmed);
      if (res.success) {
        toast.success("Discussion added successfully!");
        setMessage("");
        queryClient.invalidateQueries({ queryKey: ["discussions", tenderId] });
        queryClient.invalidateQueries({ queryKey: ["discussion-count"] });
        queryClient.invalidateQueries({ queryKey: ["tender-ids-with-discussions"] });
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to add discussion.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-400/20 dark:text-violet-400">
              <MessageSquarePlus className="size-4" />
            </div>
            Add Discussion
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Adding discussion for: <span className="font-semibold text-foreground">{tenderTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Textarea
            placeholder="Write your discussion here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="resize-none focus-visible:ring-violet-500/50"
            disabled={isSubmitting}
            autoFocus
          />

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
