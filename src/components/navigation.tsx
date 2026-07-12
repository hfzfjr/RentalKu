"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/units", label: "Units" },
    { href: "/tenants", label: "Tenants" },
    { href: "/rentals", label: "Rentals" },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <h1 className="text-xl font-bold">RentalKu</h1>
            </Link>
          </div>
          <div className="flex space-x-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
