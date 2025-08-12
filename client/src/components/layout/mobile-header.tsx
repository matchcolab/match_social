import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Menu } from "lucide-react";

interface MobileHeaderProps {
  onlineCount: number;
}

export default function MobileHeader({ onlineCount }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6 border-b border-slate-200">
                <h1 className="text-xl font-bold text-primary">Match Colab</h1>
                <p className="text-sm text-secondary mt-1">Community-first networking</p>
              </div>
              {/* Add mobile navigation menu here */}
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-semibold text-primary">Match Colab</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Real-time indicator */}
          <div className="flex items-center space-x-1 text-sm text-accent">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span>{onlineCount} online</span>
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
