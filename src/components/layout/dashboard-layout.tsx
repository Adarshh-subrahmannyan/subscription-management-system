"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Close drawer on Escape
  useEffect(() => {
    if (!isSidebarOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsSidebarOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-surface-muted text-ink">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <button
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-[2px] lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isOpen={isSidebarOpen}
        onNavigate={() => setIsSidebarOpen(false)}
      />

      {/* Main column */}
      <div
        className={[
          "flex min-h-screen min-w-0 flex-1 flex-col",
          "transition-[margin] duration-200 motion-reduce:transition-none",
          "lg:ml-0",
        ].join(" ")}
      >
        <Navbar
          isSidebarCollapsed={isSidebarCollapsed}
          isMobileMenuOpen={isSidebarOpen}
          onToggleCollapse={() =>
            setIsSidebarCollapsed((collapsed) => !collapsed)
          }
          onToggleMobileMenu={() => setIsSidebarOpen((open) => !open)}
        />

        <main
          className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 animate-fade-in"
          id="main-content"
        >
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
