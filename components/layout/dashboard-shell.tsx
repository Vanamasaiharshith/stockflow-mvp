"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    organizationId: string;
  };
  organization: {
    id: string;
    name: string;
    currency: string;
    defaultThreshold: number;
  };
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  organization,
  children,
}: DashboardShellProps) {
  const [isOpenMobile, setIsOpenMobile] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        user={user}
        organization={organization}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          user={user}
          organization={organization}
          onOpenMobile={() => setIsOpenMobile(true)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
