"use client";

import { MenuIcon, PanelsTopLeft } from "lucide-react";
import Link from "next/link";
import { Menu } from "@/components/menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger render={<Button className="h-8 lg:hidden" variant="outline" size="icon" />}>
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col px-3 sm:w-72" side="left">
        <SheetHeader>
          <Link href="/" className="flex items-center justify-center gap-2 pb-2 pt-1">
            <PanelsTopLeft className="mr-1 size-6" />
            <SheetTitle className="text-lg font-bold">RFP Dashboard</SheetTitle>
          </Link>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
