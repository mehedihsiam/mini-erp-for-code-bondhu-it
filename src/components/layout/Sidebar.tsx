import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  LineChart,
  LogOut,
  FileText
} from "lucide-react";
import Logo from "@/assets/cb-logo-header.svg";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/products", icon: Package },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Suppliers", href: "/suppliers", icon: Truck },
  { title: "Purchases", href: "/purchases", icon: ShoppingCart },
  { title: "Sales", href: "/sales", icon: LineChart },
  { title: "Reports", href: "/reports", icon: FileText },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card px-4 py-6">
      <div className="mb-8 flex items-center justify-center p-2">
        <img src={Logo} alt="Code Bondhu Logo" className="w-full h-auto object-contain" />
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive ? "font-semibold" : "font-normal")}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col space-y-4 pt-4 border-t">
        <div className="px-2 text-sm text-muted-foreground truncate">
          {user?.email}
        </div>
        <Button variant="outline" className="w-full justify-start" onClick={signOut}>
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
