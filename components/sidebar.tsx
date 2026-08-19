"use client";

import { PanelsTopLeft } from "lucide-react";
import Link from "next/link";
import { Menu } from "@/components/menu";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) {
    return null;
  }
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 h-screen -translate-x-full transition-[width] duration-300 ease-in-out lg:translate-x-0",
        !getOpenState() ? "w-[90px]" : "w-72",
        settings.disabled && "hidden"
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative flex h-full flex-col overflow-y-auto bg-sidebar px-3 py-4 shadow-md dark:shadow-zinc-800"
      >
        <Link
          href="/"
          className={cn(
            "mb-1 flex items-center gap-2 py-2 px-3 text-lg font-bold text-primary transition-transform duration-300 ease-in-out hover:opacity-80",
            !getOpenState() ? "translate-x-1" : "translate-x-0"
          )}
        >
          <PanelsTopLeft className="mr-1 size-6 shrink-0" />
          <h1
            className={cn(
              "whitespace-nowrap transition-[transform,opacity,display] duration-300 ease-in-out",
              !getOpenState()
                ? "hidden -translate-x-96 opacity-0"
                : "translate-x-0 opacity-100"
            )}
          >
            RFP Dashboard
          </h1>
        </Link>
        <Menu isOpen={getOpenState()} />
      </div>
    </aside>
  );
}
