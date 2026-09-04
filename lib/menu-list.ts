import { LayoutDashboard, FilePlus2, Sparkles, ListTodo} from "lucide-react";
import type { ComponentType } from "react";

type Submenu = { href: string; label: string; active?: boolean };

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: ComponentType<{ className?: string }>;
  submenus?: Submenu[];
};

type Group = { groupLabel: string; menus: Menu[] };

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          active: pathname === "/dashboard" || pathname === "/",
        },
      ],
    },
    {
      groupLabel: "Tender Management",
      menus: [
        {
          href: "/new-tender",
          label: "New Tender",
          icon: FilePlus2,
          active: pathname.startsWith("/new-tender"),
        },
        {
          href: "/ai-extract",
          label: "AI Extract",
          icon: Sparkles,
          active: pathname.startsWith("/ai-extract"),
        },
        {
          href: "/incoming-bid",
          label: "Incoming Bids",
          icon: ListTodo,
          active: pathname.startsWith("/incoming-bid"),
        },
      ],
    },
  ];
}
