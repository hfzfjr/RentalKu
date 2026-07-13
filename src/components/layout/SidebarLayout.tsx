"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";

interface SidebarLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SidebarLayout({ children, title, description, action }: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground p-2 cursor-pointer"
                aria-label="Open sidebar"
              >
                <span className="text-xl">☰</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
