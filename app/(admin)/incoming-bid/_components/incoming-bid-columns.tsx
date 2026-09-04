"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2, Calendar, Building2, User } from "lucide-react";

export type IncomingBidRow = {
  id: string;
  userId: string;
  Department: string;
  bidDetails: string;
  oemDetails: string | null;
  remarks: string | null;
  publicationDate: Date;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
  userEmail: string | null;
};

export function getIncomingBidColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (bid: IncomingBidRow) => void;
  onDelete: (bid: IncomingBidRow) => void;
}): ColumnDef<IncomingBidRow>[] {
  /** Format any Date/string to IST */
  const toIST = (date: Date | string) => {
    const d = new Date(date);
    return format(d, "dd MMM yyyy");
  };

  const toISTFull = (date: Date | string) => {
    const d = new Date(date);
    return format(d, "dd MMM yyyy, hh:mm a");
  };

  return [
    {
      accessorKey: "Department",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Building2 className="mr-1.5 size-3.5" />
          Department
          <ArrowUpDown className="ml-1.5 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-sm max-w-[180px] truncate" title={row.getValue("Department")}>
          {row.getValue("Department")}
        </div>
      ),
    },
    {
      accessorKey: "bidDetails",
      header: () => <span className="text-xs font-semibold">Bid Details</span>,
      cell: ({ row }) => {
        const details = row.getValue("bidDetails") as string;
        return (
          <div
            className="text-sm text-muted-foreground max-w-[280px] line-clamp-2"
            title={details}
          >
            {details}
          </div>
        );
      },
    },
    {
      accessorKey: "oemDetails",
      header: () => <span className="text-xs font-semibold">OEM Details</span>,
      cell: ({ row }) => {
        const oem = row.getValue("oemDetails") as string | null;
        return oem ? (
          <div className="text-sm text-muted-foreground max-w-[180px] truncate" title={oem}>
            {oem}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        );
      },
    },
    {
      accessorKey: "publicationDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Calendar className="mr-1.5 size-3.5" />
          Publication Date
          <ArrowUpDown className="ml-1.5 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("publicationDate") as Date;
        const now = new Date();
        const pub = new Date(date);
        const diffDays = Math.ceil((pub.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isUpcoming = diffDays > 0 && diffDays <= 7;
        const isPast = diffDays < 0;

        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium tabular-nums">{toIST(date)}</span>
            {isUpcoming && (
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                {diffDays}d away
              </Badge>
            )}
            {isPast && (
              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                Released
              </Badge>
            )}
          </div>
        );
      },
      sortingFn: "datetime",
    },
    {
      accessorKey: "remarks",
      header: () => <span className="text-xs font-semibold">Remarks</span>,
      cell: ({ row }) => {
        const remarks = row.getValue("remarks") as string | null;
        return remarks ? (
          <div className="text-sm text-muted-foreground max-w-[180px] truncate" title={remarks}>
            {remarks}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        );
      },
    },
    {
      accessorKey: "userName",
      header: () => (
        <span className="text-xs font-semibold flex items-center gap-1.5">
          <User className="size-3.5" />
          Added By
        </span>
      ),
      cell: ({ row }) => {
        const name = row.getValue("userName") as string | null;
        return (
          <span className="text-xs font-medium text-muted-foreground">
            {name || "Unknown"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Added On
          <ArrowUpDown className="ml-1.5 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {toISTFull(row.getValue("createdAt"))}
        </span>
      ),
      sortingFn: "datetime",
    },
    {
      id: "actions",
      header: () => <span className="text-xs font-semibold">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ];
}
