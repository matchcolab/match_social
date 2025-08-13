import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Users, 
  Handshake, 
  Compass, 
  TrendingUp, 
  Settings,
  Crown
} from "lucide-react";
import type { User } from "@shared/schema";

interface SidebarProps {
  user: User;
  onlineCount: number;
}

export default function Sidebar({ user, onlineCount }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Today's Community", icon: Home },
    { path: "/groups", label: "My Groups", icon: Users, badge: "2" },
    { path: "/introductions", label: "Introductions", icon: Handshake, badge: "1" },
    { path: "/discover", label: "Discover", icon: Compass },
    { path: "/profile", label: "My Connections", icon: TrendingUp },
    ...(user.role === 'admin' ? [{ path: "/admin", label: "Admin Dashboard", icon: Settings }] : []),
  ];

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <aside className="hidden xl:flex xl:flex-col xl:w-64 xl:fixed xl:inset-y-0 bg-white border-r border-slate-200">
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Logo and Brand */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-primary">Match Colab</h1>
          <p className="text-sm text-secondary mt-1">Community-first networking</p>
        </div>

        {/* Real-time Status */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-accent font-medium">{onlineCount} online now</span>
            </div>
            <span className="text-secondary">3 new prompts</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <a className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? "text-primary bg-blue-50 border-l-4 border-primary" 
                    : "text-secondary hover:text-slate-800 hover:bg-slate-50"
                }`}>
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-accent text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Premium Upgrade */}
        <div className="p-4 border-t border-slate-200">
          <div className="bg-gradient-to-r from-primary to-accent p-4 rounded-lg text-white text-sm">
            <div className="flex items-center mb-2">
              <Crown className="h-4 w-4 mr-2" />
              <h3 className="font-semibold">Unlock Introductions</h3>
            </div>
            <p className="text-blue-100 mb-3">Connect privately with community members</p>
            <Button className="w-full bg-white text-primary font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
              Upgrade Now
            </Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profileImageUrl || ""} alt="Profile" />
              <AvatarFallback className="bg-primary text-white">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-secondary truncate">
                {user.title && user.age ? `${user.title}, ${user.age}` : user.title || `Age ${user.age}` || 'Member'}
              </p>
            </div>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="p-1">
                <Settings className="h-4 w-4 text-secondary" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
