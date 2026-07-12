"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "📊" },
  { label: "Unit Kendaraan", href: "/units", icon: "🚗" },
  { label: "Data Penyewa", href: "/tenants", icon: "👥" },
  { label: "Penyewaan", href: "/rentals", icon: "📋" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:z-40 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">RentalKu</h1>
            <p className="text-sm text-muted-foreground mt-1">Manajemen Rental Kendaraan</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground p-2"
            aria-label="Close sidebar"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © 2024 RentalKu
          </p>
        </div>
      </aside>
    </>
  );
}
