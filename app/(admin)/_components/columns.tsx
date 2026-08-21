"use client";

import { useState } from "react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle2, Eye, FileText, MoreHorizontal, Pencil, Trash2, XCircle } from "lucide-react";
import { Tender } from "@/lib/db/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTenderAction, toggleBidSubmittedAction } from "../lib/action";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { TenderDetailsDialog } from "./tender-details-dialog";
import { TenderEditDialog } from "./tender-edit-dialog";

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

const dateRangeFilterFn: FilterFn<Tender> = (row, columnId, filterValue) => {
  if (!filterValue) return true;
  const { from, to } = filterValue as { from?: string; to?: string };
  if (!from && !to) return true;

  const rawValue = row.getValue(columnId);
  if (!rawValue) return false;
  const rowDate = new Date(rawValue as any);
  if (isNaN(rowDate.getTime())) return false;

  if (from) {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    if (rowDate < fromDate) return false;
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    if (rowDate > toDate) return false;
  }
  return true;
};

export const columns: ColumnDef<Tender>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const fullId = (row.getValue("id") as string) || "";
      const last5 = fullId ? fullId.slice(-8).toUpperCase() : "-";
      return (
        <span
          className="font-mono text-xs font-bold text-muted-foreground uppercase"
          title={`Full ID: ${fullId}`}
        >
          {last5}
        </span>
      );
    },
  },
  {
    accessorKey: "tenderId",
    header: "Tender Ref ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold">
        {row.getValue("tenderId") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 font-semibold"
      >
        Tender Title
        <ArrowUpDown className="ml-2 size-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const { data: session } = useSession();
      const isSuperAdmin = session?.user?.role?.toUpperCase() === "SUPERADMIN";
      const [showDetails, setShowDetails] = useState(false);
      const tender = row.original;

      return (
        <div className="max-w-[220px]">
          {isSuperAdmin ? (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="font-medium text-foreground hover:text-primary hover:underline text-left truncate block w-full cursor-pointer"
              title="Click to view full details"
            >
              {row.getValue("title")}
            </button>
          ) : (
            <span className="font-medium text-foreground text-left truncate block w-full">
              {row.getValue("title")}
            </span>
          )}
          <p className="text-xs text-muted-foreground truncate">{tender.client}</p>
          {tender.documentUrl && (
            <a
              href={tender.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline mt-0.5"
              title="View Uploaded PDF Document"
            >
              <FileText className="size-3" /> PDF Document
            </a>
          )}

          {isSuperAdmin && (
            <TenderDetailsDialog
              tender={tender}
              open={showDetails}
              onOpenChange={setShowDetails}
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => row.getValue("location") || "-",
  },
  {
    accessorKey: "tenderValue",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 font-semibold"
      >
        Tender Value
        <ArrowUpDown className="ml-2 size-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-semibold">
        {formatCurrency(row.getValue("tenderValue"))}
      </span>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      if (!priority) return "-";
      const variantMap: Record<string, "destructive" | "default" | "secondary"> = {
        HIGH: "destructive",
        MEDIUM: "default",
        LOW: "secondary",
      };
      return <Badge variant={variantMap[priority] || "secondary"}>{priority}</Badge>;
    },
    filterFn: "equals",
  },
  {
    accessorKey: "eligibility",
    header: "Eligibility",
    cell: ({ row }) => {
      const eligibility = row.getValue("eligibility") as string;
      if (!eligibility) return "-";
      return (
        <Badge
          className={
            eligibility === "ELIGIBLE"
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-rose-600 text-white hover:bg-rose-700"
          }
        >
          {eligibility}
        </Badge>
      );
    },
    filterFn: "equals",
  },
  {
    accessorKey: "isBidSubmitted",
    header: "Bid Status",
    cell: ({ row }) => {
      const tender = row.original;
      const submitted = tender.isBidSubmitted;
      const queryClient = useQueryClient();

      const handleToggle = async (newVal: boolean) => {
        const res = await toggleBidSubmittedAction(tender.id, newVal);
        if (res.success) {
          toast.success(newVal ? "Marked as Submitted" : "Marked as Not Submitted");
          queryClient.invalidateQueries({ queryKey: ["tenders"] });
        } else {
          toast.error(res.error || "Failed to update status");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={submitted}
            onCheckedChange={handleToggle}
            aria-label="Toggle bid submission status"
          />
          <Badge variant={submitted ? "default" : "outline"} className="text-xs">
            {submitted ? "Submitted" : "Not Submitted"}
          </Badge>
        </div>
      );
    },
    filterFn: "equals",
  },
  {
    accessorKey: "lastDate",
    header: "Last Date",
    cell: ({ row }) => formatDate(row.getValue("lastDate")),
    filterFn: dateRangeFilterFn,
  },
  {
    accessorKey: "publishDate",
    header: "Publish Date",
    cell: ({ row }) => formatDate(row.getValue("publishDate")),
    filterFn: dateRangeFilterFn,
  },
  {
    accessorKey: "openingDate",
    header: "Opening Date",
    cell: ({ row }) => formatDate(row.getValue("openingDate")),
    filterFn: dateRangeFilterFn,
  },
  {
    accessorKey: "responsiblePerson",
    header: "Responsible",
    cell: ({ row }) => row.getValue("responsiblePerson") || "-",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { data: session } = useSession();
      const isSuperAdmin = session?.user?.role?.toUpperCase() === "SUPERADMIN";
      const tender = row.original;
      const [showDetails, setShowDetails] = useState(false);
      const [showEdit, setShowEdit] = useState(false);
      const queryClient = useQueryClient();

      const handleToggle = async () => {
        const newVal = !tender.isBidSubmitted;
        const res = await toggleBidSubmittedAction(tender.id, newVal);
        if (res.success) {
          toast.success(newVal ? "Marked as Submitted" : "Marked as Not Submitted");
          queryClient.invalidateQueries({ queryKey: ["tenders"] });
        } else {
          toast.error(res.error || "Failed to update status");
        }
      };

      const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete tender "${tender.title}"?`)) {
          const res = await deleteTenderAction(tender.id);
          if (res.success) {
            toast.success("Tender deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["tenders"] });
          } else {
            toast.error(res.error || "Failed to delete tender");
          }
        }
      };

      return (
        <div className="flex items-center gap-1">
          {/* Only SUPERADMIN can see the Quick View Eye button */}
          {isSuperAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setShowDetails(true)}
              title="View Full Details"
            >
              <Eye className="size-4" />
              <span className="sr-only">View Details</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="size-8 p-0" />}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {/* Only SUPERADMIN can see the View menu item */}
                {isSuperAdmin && (
                  <DropdownMenuItem onClick={() => setShowDetails(true)}>
                    <Eye className="mr-2 size-4 text-primary" />
                    View
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  <Pencil className="mr-2 size-4 text-blue-600 dark:text-blue-400" />
                  Edit Tender
                </DropdownMenuItem>
                {tender.documentUrl && (
                  <DropdownMenuItem onClick={() => window.open(tender.documentUrl || "", "_blank")}>
                    <FileText className="mr-2 size-4 text-red-600" />
                    View PDF Document
                  </DropdownMenuItem>
                )}
                {/* <DropdownMenuItem onClick={handleToggle}>
                  {tender.isBidSubmitted ? (
                    <>
                      <CheckCircle2 className="mr-2 size-4 text-emerald-500" />

                      Submitted
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 size-4 text-amber-500" />
                      Not Submitted
                    </>
                  )}
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(tender.id);
                  toast.success("Tender ID copied to clipboard");
                }}>
                  Copy Tender ID
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {isSuperAdmin && (
            <TenderDetailsDialog
              tender={tender}
              open={showDetails}
              onOpenChange={setShowDetails}
            />
          )}

          <TenderEditDialog
            tender={tender}
            open={showEdit}
            onOpenChange={setShowEdit}
          />
        </div>
      );
    },
  },
];
