import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, User } from "lucide-react";
import type { Introduction, User as UserType } from "@shared/schema";

interface RightSidebarProps {
  userId: string;
}

export default function RightSidebar({ userId }: RightSidebarProps) {
  const { data: introductions = [] } = useQuery<(Introduction & { requester: UserType; target: UserType })[]>({
    queryKey: ["/api/introductions"],
  });

  const { data: stats } = useQuery<{
    newResponses: number;
    introductions: number;
    activeGroups: number;
    onlineUsers: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const pendingIntroductions = introductions.filter(intro => intro.status === 'pending');

  return (
    <aside className="hidden xl:block w-80 bg-white border-l border-slate-200 p-6 fixed right-0 top-0 h-full overflow-y-auto">
      {/* Pending Introductions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Introduction Requests</h3>
        <div className="space-y-3">
          {pendingIntroductions.length > 0 ? (
            pendingIntroductions.slice(0, 3).map((intro) => (
              <div key={intro.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={intro.requester.profileImageUrl || ""} />
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(intro.requester.firstName, intro.requester.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 mb-1">
                      {intro.requester.firstName} {intro.requester.lastName} wants to connect
                    </p>
                    <p className="text-xs text-secondary mb-2">
                      {intro.message?.substring(0, 80)}...
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" className="px-3 py-1 text-xs">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" className="px-3 py-1 text-xs">
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-secondary text-sm py-4">
              No pending introduction requests
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start p-3 bg-slate-50 hover:bg-slate-100"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Plus className="h-4 w-4 mr-3 text-primary" />
            <span className="text-sm font-medium text-slate-700">Share Something</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start p-3 bg-slate-50 hover:bg-slate-100"
            onClick={() => window.location.href = '/groups'}
          >
            <Search className="h-4 w-4 mr-3 text-accent" />
            <span className="text-sm font-medium text-slate-700">Find New Groups</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start p-3 bg-slate-50 hover:bg-slate-100"
            onClick={() => window.location.href = '/profile'}
          >
            <User className="h-4 w-4 mr-3 text-secondary" />
            <span className="text-sm font-medium text-slate-700">Update Profile</span>
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Community Today</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary">New responses</span>
              <span className="font-medium text-slate-800">{stats?.newResponses || 127}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Introductions made</span>
              <span className="font-medium text-slate-800">{stats?.introductions || 18}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Active groups</span>
              <span className="font-medium text-slate-800">{stats?.activeGroups || 23}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
