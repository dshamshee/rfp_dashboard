"use client";

import { useMemo, useState } from "react";
import { ContentLayout } from "@/components/content-layout";
import { useGetIncomingBidsQuery } from "./query/get-incoming-bids";
import { getIncomingBidColumns, IncomingBidRow } from "./_components/incoming-bid-columns";
import { IncomingBidDataTable } from "./_components/incoming-bid-data-table";
import { AddIncomingBidDialog } from "./_components/add-incoming-bid-dialog";
import { EditIncomingBidDialog } from "./_components/edit-incoming-bid-dialog";
import { DeleteIncomingBidDialog } from "./_components/delete-incoming-bid-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  PlusCircle,
  ListTodo,
  CalendarClock,
  Building2,
  TrendingUp,
} from "lucide-react";

export default function IncomingBidPage() {
  const { data: bids = [], isLoading, error } = useGetIncomingBidsQuery();

  const [addOpen, setAddOpen] = useState(false);
  const [editBid, setEditBid] = useState<IncomingBidRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteBid, setDeleteBid] = useState<IncomingBidRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = (bid: IncomingBidRow) => {
    setEditBid(bid);
    setEditOpen(true);
  };

  const handleDelete = (bid: IncomingBidRow) => {
    setDeleteBid(bid);
    setDeleteOpen(true);
  };

  const columns = useMemo(
    () => getIncomingBidColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    []
  );

  // Stats calculations
  const totalBids = bids.length;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthBids = bids.filter(
    (b) => new Date(b.createdAt) >= startOfMonth
  ).length;

  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const upcomingBids = bids.filter((b) => {
    const pubDate = new Date(b.publicationDate);
    return pubDate >= now && pubDate <= sevenDaysFromNow;
  }).length;

  const uniqueDepartments = new Set(bids.map((b) => b.Department)).size;

  return (
    <ContentLayout title="Incoming Bids">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Incoming Bids</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage expected bids that are anticipated to be released.
            </p>
          </div>
          <Button className="gap-2 shadow-sm" onClick={() => setAddOpen(true)}>
            <PlusCircle className="size-4" />
            Add New Bid
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="relative grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-4">
          <div className="absolute top-0 left-0 right-0 h-1 z-10 bg-gradient-to-r from-blue-600 via-indigo-500 via-purple-500 to-rose-500" />

          {/* Total Bids */}
          <div className="flex flex-col gap-1 bg-card px-4 pt-4 pb-3.5">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <ListTodo className="size-3 text-muted-foreground" />
              Total Bids
            </span>
            {isLoading ? (
              <Skeleton className="h-8 w-12 my-0.5" />
            ) : (
              <span className="text-2xl font-bold tabular-nums tracking-tight">
                {totalBids}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/70">All tracked incoming bids</span>
          </div>

          {/* This Month */}
          <div className="flex flex-col gap-1 bg-card px-4 pt-4 pb-3.5">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-3 text-muted-foreground" />
              Added This Month
            </span>
            {isLoading ? (
              <Skeleton className="h-8 w-12 my-0.5" />
            ) : (
              <span className="text-2xl font-bold tabular-nums tracking-tight">
                {thisMonthBids}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/70">Since {startOfMonth.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
          </div>

          {/* Upcoming (7 days) */}
          <div className="flex flex-col gap-1 bg-card px-4 pt-4 pb-3.5">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <CalendarClock className="size-3 text-muted-foreground" />
              Upcoming (7 days)
            </span>
            {isLoading ? (
              <Skeleton className="h-8 w-12 my-0.5" />
            ) : (
              <span className="text-2xl font-bold tabular-nums tracking-tight">
                {upcomingBids}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/70">
              {upcomingBids > 0 ? "Expected to release soon" : "No upcoming releases"}
            </span>
          </div>

          {/* Unique Departments */}
          <div className="flex flex-col gap-1 bg-card px-4 pt-4 pb-3.5">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Building2 className="size-3 text-muted-foreground" />
              Departments
            </span>
            {isLoading ? (
              <Skeleton className="h-8 w-12 my-0.5" />
            ) : (
              <span className="text-2xl font-bold tabular-nums tracking-tight">
                {uniqueDepartments}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/70">Unique departments tracked</span>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="flex h-52 flex-col items-center justify-center gap-3 rounded-md border bg-card">
            <Spinner className="size-6 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Loading incoming bids...</p>
          </div>
        ) : error ? (
          <div className="flex h-48 items-center justify-center rounded-md border border-destructive bg-destructive/10 p-4 text-center">
            <p className="text-sm font-medium text-destructive">
              Error loading incoming bids. Make sure database connection is configured.
            </p>
          </div>
        ) : (
          <IncomingBidDataTable columns={columns} data={bids as IncomingBidRow[]} />
        )}
      </div>

      {/* Dialogs */}
      <AddIncomingBidDialog
        open={addOpen}
        onOpenChange={setAddOpen}
      />
      <EditIncomingBidDialog
        bid={editBid}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteIncomingBidDialog
        bid={deleteBid}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </ContentLayout>
  );
}
