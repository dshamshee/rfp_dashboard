"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getMenuList } from "@/lib/menu-list";
import { cn } from "@/lib/utils";

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);

  return (
    <div className="w-full flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <nav className="mt-8 h-full w-full">
        <ul className="flex min-h-[calc(100vh-48px-36px-16px-32px)] flex-col items-start gap-1 px-2 lg:min-h-[calc(100vh-32px-40px-32px)]">
          {menuList.map(({ groupLabel, menus }) => (
            <li
              className={cn("w-full", groupLabel ? "pt-5" : "")}
              key={`${groupLabel}-${menus.map((menu) => menu.href).join("-")}`}
            >
              {isOpen && groupLabel ? (
                <p className="max-w-[248px] truncate px-4 pb-2 text-sm font-medium text-muted-foreground">
                  {groupLabel}
                </p>
              ) : !isOpen && groupLabel ? (
                <TooltipProvider delay={100}>
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <div className="flex w-full items-center justify-center">
                        <Ellipsis className="size-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2" />
              )}
              {menus.map(({ href, label, icon: Icon, active }) =>
                !isOpen ? (
                  <div className="mb-1 w-full" key={href}>
                    <TooltipProvider delay={100}>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              href={href}
                              className={cn(
                                buttonVariants({
                                  variant: active ? "secondary" : "ghost",
                                }),
                                "mb-1 h-10 w-full justify-start flex items-center"
                              )}
                            />
                          }
                        >
                          <span className="mr-4">
                            <Icon className="size-5" />
                          </span>
                          <p className="-translate-x-96 opacity-0 max-w-[200px] truncate">
                            {label}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="right">{label}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <div className="mb-1 w-full" key={href}>
                    <Link
                      href={href}
                      className={cn(
                        buttonVariants({
                          variant: active ? "secondary" : "ghost",
                        }),
                        "mb-1 h-10 w-full justify-start flex items-center"
                      )}
                    >
                      <span className="mr-4">
                        <Icon className="size-5" />
                      </span>
                      <p className="translate-x-0 opacity-100 max-w-[200px] truncate">
                        {label}
                      </p>
                    </Link>
                  </div>
                )
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
