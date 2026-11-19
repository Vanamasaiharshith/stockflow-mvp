"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu, Building2, UserCircle2 } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  user: {
    name: string;
    email: string;
  };
  organization: {
    name: string;
  };
  onOpenMobile: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Executive Dashboard",
    subtitle: "Real-time stock valuation, health status, and inventory KPIs",
  },
  "/products": {
    title: "Product Inventory",
    subtitle: "Manage, filter, search, and adjust organization product inventory",
  },
  "/inventory-insights": {
    title: "Inventory Insights & Intelligence",
    subtitle: "Analytics on stock health, high-value assets, and distribution",
  },
  "/settings": {
    title: "Organization & Account Settings",
    subtitle: "Configure business details, threshold defaults, and profile",
  },
};

export function Header({ user, organization, onOpenMobile }: HeaderProps) {
  const pathname = usePathname();
  const current = pageTitles[pathname] || {
    title: "StockFlow",
    subtitle: "Inventory Management Platform",
  };

  const getBreadcrumbName = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/products":
        return "Products";
      case "/inventory-insights":
        return "Insights";
      case "/settings":
        return "Settings";
      default:
        return "Overview";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 md:px-8 backdrop-blur-md shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Title & Breadcrumbs */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-slate-600">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              {organization.name}
            </span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">
              {getBreadcrumbName(pathname)}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {current.title}
          </h1>
        </div>
      </div>

      {/* Header Right */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800">{user.name}</span>
            <span className="text-[10px] text-slate-400">{user.email}</span>
          </div>
          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            title="Account Settings"
          >
            <UserCircle2 className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
