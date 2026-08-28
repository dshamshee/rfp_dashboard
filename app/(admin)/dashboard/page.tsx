"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/content-layout";
import { DataTable } from "../_components/data-table";
import { columns } from "../_components/columns";
import { useGetTendersQuery } from "../query/get-tenders";
import { useGetDiscussionCountQuery, useGetTenderIdsWithDiscussionsQuery } from "../query/get-discussions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  EyeOff,
  Clock,
  MessageSquare,
  Gavel,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const [showTable, setShowTable] = useState(false);
  const [tableFilterMode, setTableFilterMode] = useState<"ALL" | "DUE_WEEK" | "PREBID_WEEK" | "HAS_DISCUSSIONS">("ALL");
  const { data: tenders = [], isLoading, error } = useGetTendersQuery();
  const { data: discussionCount = 0, isLoading: isDiscussionLoading } = useGetDiscussionCountQuery();
  const { data: tenderIdsWithDiscussions = [] as string[] } = useGetTenderIdsWithDiscussionsQuery();

  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysFromNow = new Date(startOfToday);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  sevenDaysFromNow.setHours(23, 59, 59, 999);

  const totalTenders = tenders.length;
  const submittedBids = tenders.filter((t) => t.isBidSubmitted).length;
  const highPriorityCount = tenders.filter((t) => t.priority === "HIGH").length;
  const totalValue = tenders.reduce((acc, t) => acc + (t.tenderValue || 0), 0);
  const submissionRate = totalTenders ? Math.round((submittedBids / totalTenders) * 100) : 0;

  const dueWithinWeekTenders = tenders.filter((t) => {
    if (t.isBidSubmitted) return false;
    if (!t.lastDate) return false;
    const lastD = new Date(t.lastDate);
    return lastD >= startOfToday && lastD <= sevenDaysFromNow;
  });
  const dueWithinWeekCount = dueWithinWeekTenders.length;

  const preBidWithinWeekTenders = tenders.filter((t) => {
    if (!t.preBidDate) return false;
    const preBidD = new Date(t.preBidDate);
    return preBidD >= startOfToday && preBidD <= sevenDaysFromNow;
  });
  const preBidWithinWeekCount = preBidWithinWeekTenders.length;

  const tendersWithDiscussions = tenders.filter((t) => tenderIdsWithDiscussions.includes(t.id));

  const tableData =
    tableFilterMode === "DUE_WEEK" ? dueWithinWeekTenders
    : tableFilterMode === "PREBID_WEEK" ? preBidWithinWeekTenders
    : tableFilterMode === "HAS_DISCUSSIONS" ? tendersWithDiscussions
    : tenders;

  const handleToggleTable = (mode: typeof tableFilterMode) => {
    if (showTable && tableFilterMode === mode) {
      setShowTable(false);
    } else {
      setShowTable(true);
      setTableFilterMode(mode);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const isActive = (mode: typeof tableFilterMode) => showTable && tableFilterMode === mode;

  return (
    <ContentLayout title="MagNetix InfoSystems & Development Pvt. Ltd.">
      <div className="space-y-4">
        {/* Pre-Bid Alert */}
        {isLoading ? (
          <Skeleton className="h-14 w-full rounded-lg" />
        ) : preBidWithinWeekCount > 0 ? (
          <button
            type="button"
            onClick={() => handleToggleTable("PREBID_WEEK")}
            className={`relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border px-4 py-3 text-left transition-colors print:hidden ${
              isActive("PREBID_WEEK")
                ? "border-cyan-500/40 bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-card"
                : "border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-card hover:from-amber-500/15"
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {preBidWithinWeekCount} tender{preBidWithinWeekCount > 1 ? "s" : ""} with pre-bid date within 7 days
                </p>
                <p className="text-[11px] text-muted-foreground">Upcoming pre-bid meetings need attention</p>
              </div>
            </div>
            <span className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              {isActive("PREBID_WEEK") ? "Viewing ↓" : "View Tenders →"}
            </span>
          </button>
        ) : null}

        {/* Stats Grid */}
        <div className="relative grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3 lg:grid-cols-6 print:hidden">
          {/* Top Single Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 z-10 bg-gradient-to-r from-blue-600 via-indigo-500 via-purple-500 via-rose-500 to-amber-500" />

          {/* Total Tenders */}
          <button
            type="button"
            onClick={() => handleToggleTable("ALL")}
            className={`group flex flex-col gap-1 bg-card px-4 pt-4 pb-3.5 text-left transition-colors hover:bg-accent/50 ${isActive("ALL") ? "bg-accent/60" : ""}`}
          >
            <span className="text-[11px] font-medium text-muted-foreground">Total Tenders</span>
            {isLoading ? (
              <Skeleton className="h-8 w-12 my-0.5" />
            ) : (
              <span className="text-2xl font-bold tabular-nums tracking-tight">{totalTenders}</span>
            )}
            <span className="text-[10px] text-muted-foreground/70">
              {isActive("ALL") ? "Viewing all ↓" : "Click to view"}
            </span>
          </button>

          {/* Due Within 7 Days (Submission Last Date) */}
          <button
            type="button"
            onClick={() => handleToggleTable("DUE_WEEK")}
            className={`group flex flex-col gap-1 bg-card px-4 pt-4 pb-3.5 text-left transition-colors hover:bg-accent/50 ${isActive("DUE_WEEK") ? "bg-accent/60" : ""}`}
          >
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3 text-muted-foreground" />
              Closing Soon (7 Days)
            </span>
            {isLoading ? (
              <Skeleton className="h-8 w-12 my-0.5" />
            ) : (
              <span className="text-2xl font-bold tabular-nums tracking-tight">
                {dueWithinWeekCount}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/70">
              Last date for submission
            </span>
          </button>

          {/* Bids Submitted */}
          <div className="flex flex-col gap-1 bg-card px-4 pt-4 pb-3.5">
            <span className="text-[11px] font-medium text-muted-foreground">Bids Submitted</span>
            {isLoading ? (
              <Skeleton className="h-8 w-20 my-0.5" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums tracking-tight">{submittedBids}</span>
                <span className="text-xs font-semibold text-muted-foreground">{submissionRate}%</span>
              </div>
            )}
            <div className="h-1 w-full rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${submissionRate}%` }} />
            </div>
          </div>

          {/* High Priority */}
          <div className="flex flex-col gap-1 bg-card px-4 pt-4 pb-3.5">
            <span className="text-[11px] font-medium text-muted-foreground">High Priority</span>
            {isLoading ? (
              <Skeleton className="h-8 w-12 my-0.5" />
            ) : (
              <span className="text-2xl font-bold tabular-nums tracking-tight">
                {highPriorityCount}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/70">
              {isLoading ? "Checking..." : highPriorityCount > 0 ? "Needs attention" : "All clear"}
            </span>
          </div>

          {/* Discussions (5th) */}
          <button
            type="button"
            onClick={() => handleToggleTable("HAS_DISCUSSIONS")}
            className={`group flex flex-col gap-1 bg-card px-4 pt-4 pb-3.5 text-left transition-colors hover:bg-accent/50 ${isActive("HAS_DISCUSSIONS") ? "bg-accent/60" : ""}`}
          >
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="size-3 text-muted-foreground" />
              Discussions
            </span>
            {isDiscussionLoading ? (
              <Skeleton className="h-8 w-12 my-0.5" />
            ) : (
              <span className="text-2xl font-bold tabular-nums tracking-tight">
                {discussionCount}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/70">
              {isActive("HAS_DISCUSSIONS") ? "Viewing ↓" : "Tenders discussed"}
            </span>
          </button>

          {/* Portfolio Value (6th / Last) */}
          <div className="flex flex-col gap-1 bg-card px-4 pt-4 pb-3.5">
            <span className="text-[11px] font-medium text-muted-foreground">Portfolio Value</span>
            {isLoading ? (
              <Skeleton className="h-7 w-28 my-0.5" />
            ) : (
              <span className="text-lg font-bold tabular-nums tracking-tight truncate">{formatCurrency(totalValue)}</span>
            )}
            <span className="text-[10px] text-muted-foreground/70">Total tender value</span>
          </div>
        </div>

        {/* Data Table */}
        {showTable && (
          <div className="space-y-3">
            {/* Filter Banner */}
            {tableFilterMode !== "ALL" && (
              <div className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                tableFilterMode === "DUE_WEEK"
                  ? "border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-200"
                  : tableFilterMode === "PREBID_WEEK"
                  ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-800 dark:text-cyan-200"
                  : "border-violet-500/30 bg-violet-500/5 text-violet-800 dark:text-violet-200"
              }`}>
                <span className="flex items-center gap-1.5">
                  {tableFilterMode === "DUE_WEEK" && <><Clock className="size-3.5" /> Showing {dueWithinWeekCount} tender(s) due within 7 days</>}
                  {tableFilterMode === "PREBID_WEEK" && <><Gavel className="size-3.5" /> Showing {preBidWithinWeekCount} tender(s) with pre-bid in 7 days</>}
                  {tableFilterMode === "HAS_DISCUSSIONS" && <><MessageSquare className="size-3.5" /> Showing {tendersWithDiscussions.length} tender(s) with discussions</>}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTableFilterMode("ALL")}
                  className="h-6 text-[11px] font-semibold hover:bg-background"
                >
                  Show All ({totalTenders})
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="flex h-52 flex-col items-center justify-center gap-3 rounded-md border bg-card">
                <Spinner className="size-6 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Loading tenders data...</p>
              </div>
            ) : error ? (
              <div className="flex h-48 items-center justify-center rounded-md border border-destructive bg-destructive/10 p-4 text-center">
                <p className="text-sm font-medium text-destructive">
                  Error loading tenders. Make sure database connection is configured.
                </p>
              </div>
            ) : (
              <DataTable columns={columns} data={tableData} />
            )}
          </div>
        )}
      </div>
    </ContentLayout>
  );
}

