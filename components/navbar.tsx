"use client";

import { SheetMenu } from "@/components/sheet-menu";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 flex h-14 items-center sm:mx-8">
        <div className="flex items-center gap-4 lg:gap-0">
          <SheetMenu />
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        </div>
      </div>
    </header>
  );
}
