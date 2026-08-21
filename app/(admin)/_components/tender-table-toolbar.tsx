"use client";

import { useState, useEffect } from "react";
import { Table } from "@tanstack/react-table";
import { Calendar as CalendarIconHeader, Download, Printer, RotateCcw, Search, CalendarIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Tender } from "@/lib/db/schema";

interface DatePickerFilterProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function DatePickerFilter({ value, onChange, placeholder = "DD/MM/YYYY" }: DatePickerFilterProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? parseISO(value) : undefined;

  return (
    <div className="relative flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "h-8 text-xs font-normal justify-between w-[165px] px-2.5 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground font-mono inline-flex items-center gap-1 shadow-2xs cursor-pointer transition-colors",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <span>
            {selectedDate && !isNaN(selectedDate.getTime())
              ? format(selectedDate, "dd/MM/yyyy")
              : placeholder}
          </span>
          <CalendarIcon className="ml-1 size-3.5 opacity-60 shrink-0" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, "yyyy-MM-dd"));
              } else {
                onChange("");
              }
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-7 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
          title="Clear date"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

interface TenderTableToolbarProps<TData> {
  table: Table<TData>;
  data: Tender[];
}

export function TenderTableToolbar<TData>({
  table,
  data,
}: TenderTableToolbarProps<TData>) {
  const [openingFrom, setOpeningFrom] = useState<string>("");
  const [openingTo, setOpeningTo] = useState<string>("");
  const [lastFrom, setLastFrom] = useState<string>("");
  const [lastTo, setLastTo] = useState<string>("");
  const [publishFrom, setPublishFrom] = useState<string>("");
  const [publishTo, setPublishTo] = useState<string>("");

  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter ||
    !!openingFrom ||
    !!openingTo ||
    !!lastFrom ||
    !!lastTo ||
    !!publishFrom ||
    !!publishTo;

  useEffect(() => {
    const col = table.getColumn("openingDate");
    if (!openingFrom && !openingTo) {
      col?.setFilterValue(undefined);
    } else {
      col?.setFilterValue({ from: openingFrom, to: openingTo });
    }
  }, [openingFrom, openingTo, table]);

  useEffect(() => {
    const col = table.getColumn("lastDate");
    if (!lastFrom && !lastTo) {
      col?.setFilterValue(undefined);
    } else {
      col?.setFilterValue({ from: lastFrom, to: lastTo });
    }
  }, [lastFrom, lastTo, table]);

  useEffect(() => {
    const col = table.getColumn("publishDate");
    if (!publishFrom && !publishTo) {
      col?.setFilterValue(undefined);
    } else {
      col?.setFilterValue({ from: publishFrom, to: publishTo });
    }
  }, [publishFrom, publishTo, table]);

  const handleReset = () => {
    setOpeningFrom("");
    setOpeningTo("");
    setLastFrom("");
    setLastTo("");
    setPublishFrom("");
    setPublishTo("");
    table.resetColumnFilters();
    table.setGlobalFilter("");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const filteredRows = table.getFilteredRowModel().rows.map((row) => row.original as Tender);
    const exportData = filteredRows.length ? filteredRows : data;
    if (!exportData.length) return;

    const headers = [
      "System ID",
      "Tender Ref ID",
      "Title",
      "Client",
      "Location",
      "Tender Value (INR)",
      "EMD (INR)",
      "Tender Fee (INR)",
      "Priority",
      "Eligibility",
      "Bid Submitted",
      "Publish Date",
      "Last Date",
      "Opening Date",
      "Responsible Person",
    ];

    const rows = exportData.map((item) => [
      `"${item.id ? item.id.slice(-5).toUpperCase() : ""}"`,
      `"${item.tenderId || ""}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.client.replace(/"/g, '""')}"`,
      `"${item.location || ""}"`,
      item.tenderValue ?? "",
      item.emd ?? "",
      item.tenderFee ?? "",
      `"${item.priority || ""}"`,
      `"${item.eligibility || ""}"`,
      item.isBidSubmitted ? "Yes" : "No",
      item.publishDate ? format(new Date(item.publishDate), "dd/MM/yyyy") : "",
      item.lastDate ? format(new Date(item.lastDate), "dd/MM/yyyy") : "",
      item.openingDate ? format(new Date(item.openingDate), "dd/MM/yyyy") : "",
      `"${item.responsiblePerson || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tender_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-3 py-4 print:hidden">
      {/* Top Filter Row & Actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-3">
          {/* Search Filter */}
          <div className="flex flex-col gap-1.5 min-w-[200px] flex-1 max-w-xs">
            <Label htmlFor="search-filter" className="text-xs font-semibold text-muted-foreground">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="search-filter"
                placeholder="Search title, client, ID..."
                value={(table.getState().globalFilter as string) ?? ""}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex flex-col gap-1.5 min-w-[130px]">
            <Label className="text-xs font-semibold text-muted-foreground">Priority</Label>
            <Select
              value={(table.getColumn("priority")?.getFilterValue() as string) ?? "ALL"}
              onValueChange={(val) =>
                table.getColumn("priority")?.setFilterValue(val === "ALL" ? undefined : val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Eligibility Filter */}
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <Label className="text-xs font-semibold text-muted-foreground">Eligibility</Label>
            <Select
              value={(table.getColumn("eligibility")?.getFilterValue() as string) ?? "ALL"}
              onValueChange={(val) =>
                table.getColumn("eligibility")?.setFilterValue(val === "ALL" ? undefined : val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Eligibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Eligibility</SelectItem>
                <SelectItem value="ELIGIBLE">ELIGIBLE</SelectItem>
                <SelectItem value="NOT ELIGIBLE">NOT ELIGIBLE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bid Status Filter */}
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <Label className="text-xs font-semibold text-muted-foreground">Bid Status</Label>
            <Select
              value={
                table.getColumn("isBidSubmitted")?.getFilterValue() === undefined
                  ? "ALL"
                  : table.getColumn("isBidSubmitted")?.getFilterValue()
                  ? "SUBMITTED"
                  : "NOT_SUBMITTED"
              }
              onValueChange={(val) => {
                if (val === "ALL") table.getColumn("isBidSubmitted")?.setFilterValue(undefined);
                else if (val === "SUBMITTED") table.getColumn("isBidSubmitted")?.setFilterValue(true);
                else if (val === "NOT_SUBMITTED") table.getColumn("isBidSubmitted")?.setFilterValue(false);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Bids" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Bids</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="NOT_SUBMITTED">Not Submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons: Export & Print */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
          <Button variant="default" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 size-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Date Wise Filters Section */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-3.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground pr-2 border-r">
          <CalendarIconHeader className="size-4 text-primary" />
          <span>Date Filters</span>
        </div>

        {/* Opening Date Range Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground">Opening Date</span>
          <div className="flex items-center gap-1.5">
            <DatePickerFilter
              value={openingFrom}
              onChange={setOpeningFrom}
              placeholder="DD/MM/YYYY"
            />
            <span className="text-xs text-muted-foreground font-semibold">-</span>
            <DatePickerFilter
              value={openingTo}
              onChange={setOpeningTo}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        {/* Last Date Range Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground">Last Date</span>
          <div className="flex items-center gap-1.5">
            <DatePickerFilter
              value={lastFrom}
              onChange={setLastFrom}
              placeholder="DD/MM/YYYY"
            />
            <span className="text-xs text-muted-foreground font-semibold">-</span>
            <DatePickerFilter
              value={lastTo}
              onChange={setLastTo}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        {/* Publish Date Range Filter */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground">Publish Date</span>
          <div className="flex items-center gap-1.5">
            <DatePickerFilter
              value={publishFrom}
              onChange={setPublishFrom}
              placeholder="DD/MM/YYYY"
            />
            <span className="text-xs text-muted-foreground font-semibold">-</span>
            <DatePickerFilter
              value={publishTo}
              onChange={setPublishTo}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        {/* Global Reset Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs ml-auto text-muted-foreground hover:text-foreground"
          >
            Reset All
            <RotateCcw className="ml-1.5 size-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

