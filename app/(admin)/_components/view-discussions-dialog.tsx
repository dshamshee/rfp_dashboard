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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { addDiscussionAction } from "../lib/action";
import { useGetDiscussionsQuery } from "../query/get-discussions";
import {
  MessageSquare,
  Send,
  Loader2,
  MessageCircle,
  User,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface ViewDiscussionsDialogProps {
  tenderId: string;
  tenderTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewDiscussionsDialog({
  tenderId,
  tenderTitle,
  open,
  onOpenChange,
}: ViewDiscussionsDialogProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: discussions = [], isLoading } = useGetDiscussionsQuery(
    tenderId,
    open
  );

  const handleSubmit = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const res = await addDiscussionAction(tenderId, trimmed);
      if (res.success) {
        toast.success("Discussion added!");
        setNewMessage("");
        queryClient.invalidateQueries({ queryKey: ["discussions", tenderId] });
        queryClient.invalidateQueries({ queryKey: ["discussion-count"] });
        queryClient.invalidateQueries({ queryKey: ["tender-ids-with-discussions"] });
      } else {
        toast.error(res.error || "Failed to add discussion.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarColors = [
    "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  ];

  const getAvatarColor = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash |= 0;
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-400/20 dark:text-violet-400">
              <MessageSquare className="size-4" />
            </div>
            Discussions
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            <span className="font-semibold text-foreground">{tenderTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Discussion List */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading discussions...
              </span>
            </div>
          ) : discussions.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  No discussions yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Be the first to start a discussion on this tender.
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[340px] pr-3">
              <div className="space-y-1">
                {discussions.map((d, idx) => (
                  <div key={d.id}>
                    <div className="flex gap-3 py-3 px-1">
                      {/* Avatar */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getAvatarColor(d.userId)}`}
                      >
                        {getInitials(d.userName)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">
                            {d.userName || "Unknown User"}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="size-2.5" />
                            {d.createdAt
                              ? format(
                                  new Date(d.createdAt),
                                  "dd MMM yyyy, hh:mm a"
                                )
                              : "-"}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                          {d.message}
                        </p>
                      </div>
                    </div>
                    {idx < discussions.length - 1 && (
                      <Separator className="opacity-50" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Quick Add */}
        <Separator />
        <div className="flex gap-2 pt-1">
          <Textarea
            placeholder="Add to the discussion..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={2}
            className="resize-none flex-1 text-sm focus-visible:ring-violet-500/50"
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !newMessage.trim()}
            className="h-auto self-end gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-3"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 -mt-1">
          Press Ctrl+Enter to submit
        </p>
      </DialogContent>
    </Dialog>
  );
}
