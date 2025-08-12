import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Heart, Laptop, Dumbbell, ArrowRight } from "lucide-react";
import type { Group } from "@shared/schema";

interface GroupDiscoveryProps {
  userId: string;
}

type GroupWithJoinStatus = Group & { isJoined?: boolean };

export default function GroupDiscovery({ userId }: GroupDiscoveryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery<GroupWithJoinStatus[]>({
    queryKey: ["/api/groups"],
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest("POST", `/api/groups/${groupId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Joined group!",
        description: "You've successfully joined the group.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest("DELETE", `/api/groups/${groupId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Left group",
        description: "You've left the group.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to leave group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleJoinToggle = (groupId: string, isJoined: boolean) => {
    if (isJoined) {
      leaveGroupMutation.mutate(groupId);
    } else {
      joinGroupMutation.mutate(groupId);
    }
  };

  const getGroupIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('single') || lowerName.includes('relationship')) {
      return Heart;
    } else if (lowerName.includes('tech') || lowerName.includes('professional')) {
      return Laptop;
    } else if (lowerName.includes('fitness') || lowerName.includes('wellness')) {
      return Dumbbell;
    }
    return Heart; // default
  };

  const getGroupGradient = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('single') || lowerName.includes('relationship')) {
      return "from-purple-500 to-pink-500";
    } else if (lowerName.includes('tech') || lowerName.includes('professional')) {
      return "from-green-500 to-blue-500";
    } else if (lowerName.includes('fitness') || lowerName.includes('wellness')) {
      return "from-orange-500 to-red-500";
    }
    return "from-primary to-accent"; // default
  };

  if (isLoading) {
    return (
      <section className="bg-white border-t border-slate-200 p-4 lg:p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-slate-200 rounded w-32"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-4 h-32"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const featuredGroups = groups.slice(0, 6); // Show top 6 groups

  return (
    <section className="bg-white border-t border-slate-200 p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Active Groups</h2>
        <Button variant="ghost" className="text-primary text-sm font-medium hover:text-blue-600">
          Explore All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredGroups.map((group) => {
          const IconComponent = getGroupIcon(group.name);
          const gradientClass = getGroupGradient(group.name);
          
          return (
            <div 
              key={group.id} 
              className="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${gradientClass} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">{group.name}</h3>
                  <p className="text-sm text-secondary">{group.memberCount} members</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {group.description || "Connect with like-minded community members"}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sm text-accent">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>{group.activeCount || Math.floor(Math.random() * 20) + 5} active now</span>
                </div>
                
                <Button 
                  size="sm"
                  variant={group.isJoined ? "outline" : "default"}
                  onClick={() => handleJoinToggle(group.id, group.isJoined || false)}
                  disabled={joinGroupMutation.isPending || leaveGroupMutation.isPending}
                  className={group.isJoined ? "bg-accent text-white hover:bg-emerald-600" : ""}
                >
                  {group.isJoined ? "Joined" : "Join"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {featuredGroups.length === 0 && (
        <div className="text-center py-8">
          <p className="text-secondary mb-2">No groups available right now.</p>
          <p className="text-sm text-slate-500">Check back later for new communities to join!</p>
        </div>
      )}
    </section>
  );
}
