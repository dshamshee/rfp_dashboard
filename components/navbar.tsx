"use client";

import { SheetMenu } from "@/components/sheet-menu";
import { UserNav } from "@/components/user-nav";
import { ModeToggle } from "@/components/mode-toggle";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 flex h-14 items-center justify-between sm:mx-8">
        <div className="flex items-center gap-4 lg:gap-0">
          <SheetMenu />
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
