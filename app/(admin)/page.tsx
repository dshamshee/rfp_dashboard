"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/content-layout";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { useGetTendersQuery } from "./query/get-tenders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  IndianRupee,
  Eye,
  EyeOff,
  TrendingUp,
  Clock,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

export default function DashboardPage() {
  const [showTable, setShowTable] = useState(false);
  const [tableFilterMode, setTableFilterMode] = useState<"ALL" | "DUE_WEEK">("ALL");
  const { data: tenders = [], isLoading, error } = useGetTendersQuery();

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

  // Calculate tenders remaining for submission with lastDate <= 7 days from now
  const dueWithinWeekTenders = tenders.filter((t) => {
    if (t.isBidSubmitted) return false;
    if (!t.lastDate) return false;
    const lastD = new Date(t.lastDate);
    return lastD >= startOfToday && lastD <= sevenDaysFromNow;
  });
  const dueWithinWeekCount = dueWithinWeekTenders.length;

  const tableData = tableFilterMode === "DUE_WEEK" ? dueWithinWeekTenders : tenders;

  const handleToggleAllTable = () => {
    if (showTable && tableFilterMode === "ALL") {
      setShowTable(false);
    } else {
      setShowTable(true);
      setTableFilterMode("ALL");
    }
  };

  const handleShowDueWeekTable = () => {
    if (showTable && tableFilterMode === "DUE_WEEK") {
      setShowTable(false);
    } else {
      setShowTable(true);
      setTableFilterMode("DUE_WEEK");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <ContentLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid gap-4 print:hidden sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {/* Card 1: Total Tenders */}
          <Card className="relative overflow-hidden border border-border/80 bg-gradient-to-b from-card via-card to-indigo-500/[0.03] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-blue-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Tenders
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-400">
                <FileSpreadsheet className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold tracking-tight">{totalTenders}</div>
                <Button
                  variant={showTable && tableFilterMode === "ALL" ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleToggleAllTable}
                  className="h-8 gap-1.5 text-xs font-semibold shadow-2xs transition-all hover:scale-102"
                >
                  {showTable && tableFilterMode === "ALL" ? (
                    <>
                      <EyeOff className="size-3.5" />
                      Hide Table
                    </>
                  ) : (
                    <>
                      <Eye className="size-3.5" />
                      View Table
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block size-2 rounded-full bg-indigo-500 animate-pulse" />
                {showTable && tableFilterMode === "ALL" ? "Table visible below" : "Click to view all tenders"}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Due Within 7 Days */}
          <Card className="relative overflow-hidden border border-border/80 bg-gradient-to-b from-card via-card to-amber-500/[0.03] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-lg">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Due Within 7 Days
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-400">
                <Clock className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                  {dueWithinWeekCount}
                </div>
                <Button
                  variant={showTable && tableFilterMode === "DUE_WEEK" ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleShowDueWeekTable}
                  className="h-8 gap-1.5 text-xs font-semibold shadow-2xs transition-all hover:scale-102 border-amber-500/30 hover:bg-amber-500/10"
                >
                  {showTable && tableFilterMode === "DUE_WEEK" ? (
                    <>
                      <EyeOff className="size-3.5" />
                      Hide Data
                    </>
                  ) : (
                    <>
                      <Eye className="size-3.5 text-amber-600 dark:text-amber-400" />
                      View Data
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 text-amber-500" />
                  Today:
                </span>
                <span className="font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded text-[11px]">
                  {format(today, "dd/MM/yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Bids Submitted */}
          <Card className="relative overflow-hidden border border-border/80 bg-gradient-to-b from-card via-card to-emerald-500/[0.03] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bids Submitted
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold tracking-tight">{submittedBids}</div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="size-3" />
                  {submissionRate}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-3.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${submissionRate}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {submittedBids} of {totalTenders} bids submitted
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: High Priority */}
          <Card className="relative overflow-hidden border border-border/80 bg-gradient-to-b from-card via-card to-rose-500/[0.03] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-lg">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-rose-500 to-orange-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                High Priority
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/20 dark:text-rose-400">
                <AlertTriangle className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
                  {highPriorityCount}
                </div>
                {highPriorityCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-pulse">
                    Action Needed
                  </span>
                )}
              </div>
              <p className="mt-3.5 text-xs text-muted-foreground">
                Tenders requiring urgent review
              </p>
            </CardContent>
          </Card>

          {/* Card 5: Total Portfolio Value */}
          <Card className="relative overflow-hidden border border-border/80 bg-gradient-to-b from-card via-card to-sky-500/[0.03] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-lg">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-sky-500 to-indigo-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Portfolio Value
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/20 dark:text-sky-400">
                <IndianRupee className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="text-2xl font-extrabold tracking-tight truncate text-foreground">
                {formatCurrency(totalValue)}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Sum of all values</span>
                <span className="font-medium text-sky-600 dark:text-sky-400 font-mono">INR</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Data Table (Hidden by default, shown via toggle) */}
        {showTable && (
          <div className="pt-2 transition-all space-y-3">
            {/* Filter Mode Info Banner */}
            {tableFilterMode === "DUE_WEEK" && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                  <span>
                    Filter Applied: Showing <strong>{dueWithinWeekCount}</strong> tender(s) remaining for submission (due within 7 days)
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTableFilterMode("ALL")}
                  className="h-7 text-xs border-amber-500/40 hover:bg-amber-500/20 font-semibold"
                >
                  Show All Tenders ({totalTenders})
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="flex h-48 items-center justify-center rounded-md border bg-card">
                <p className="text-sm text-muted-foreground">Loading tenders data...</p>
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
