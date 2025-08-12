import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Users, Handshake, Compass, User } from "lucide-react";

export default function MobileBottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/groups", label: "Groups", icon: Users, hasNotification: true },
    { path: "/introductions", label: "Intros", icon: Handshake },
    { path: "/discover", label: "Discover", icon: Compass },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <Button variant="ghost" className={`flex flex-col items-center space-y-1 py-2 h-auto ${
                isActive ? "text-primary" : "text-secondary"
              }`}>
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.hasNotification && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></div>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
