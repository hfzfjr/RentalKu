"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Icons } from "@/components/icons";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: Icons.Dashboard },
  { label: "Unit Kendaraan", href: "/units", icon: Icons.Car },
  { label: "Data Penyewa", href: "/tenants", icon: Icons.People },
  { label: "Penyewaan", href: "/rentals", icon: Icons.Receipt },
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
        <div className="py-3 px-6 border-b border-border flex items-center justify-between">
          <div>
            <img
              src="/logo-tulisan.png"
              alt="RentalKu"
              className="w-50 h-auto"
            />
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
                <item.icon className="text-lg" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
