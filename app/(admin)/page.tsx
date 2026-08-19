"use client";

import { ContentLayout } from "@/components/content-layout";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { useGetTendersQuery } from "./query/get-tenders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, DollarSign, FileSpreadsheet, AlertTriangle, IndianRupee } from "lucide-react";

export default function DashboardPage() {
  const { data: tenders = [], isLoading, error } = useGetTendersQuery();

  const totalTenders = tenders.length;
  const submittedBids = tenders.filter((t) => t.isBidSubmitted).length;
  const highPriorityCount = tenders.filter((t) => t.priority === "HIGH").length;
  const totalValue = tenders.reduce((acc, t) => acc + (t.tenderValue || 0), 0);

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
        <div className="grid gap-4 print:hidden sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tenders
              </CardTitle>
              <FileSpreadsheet className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTenders}</div>
              <p className="text-xs text-muted-foreground">Active in dashboard</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bids Submitted
              </CardTitle>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submittedBids}</div>
              <p className="text-xs text-muted-foreground">
                {totalTenders ? Math.round((submittedBids / totalTenders) * 100) : 0}% submission rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Priority
              </CardTitle>
              <AlertTriangle className="size-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highPriorityCount}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Portfolio Value
              </CardTitle>
              <IndianRupee className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">Sum of tender values</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Data Table */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-md border bg-card">
            <p className="text-sm text-muted-foreground">Loading tenders data...</p>
          </div>
        ) : error ? (
          <div className="flex h-48 items-center justify-center rounded-md border border-destructive bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive font-medium">
              Error loading tenders. Make sure database connection is configured.
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={tenders} />
        )}
      </div>
    </ContentLayout>
  );
}
