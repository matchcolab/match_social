import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ActivityComments from "./activity-comments";
import ActivityReactions from "./activity-reactions";
import { 
  MessageSquare, 
  BarChart3, 
  Megaphone, 
  Heart,
  Clock,
  Eye,
  TrendingUp
} from "lucide-react";
import type { AdminActivity } from "@shared/schema";

interface ActivityWithDetails extends AdminActivity {
  admin: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    role: string;
  };
  _count?: {
    comments: number;
    reactions: number;
  };
}

export default function ActivityFeed() {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  const { data: activities, isLoading } = useQuery<ActivityWithDetails[]>({
    queryKey: ['/api/admin/activities'],
  });

  const activityTypeConfig = {
    question: { icon: MessageSquare, color: 'bg-blue-100 text-blue-700', label: 'Question' },
    poll: { icon: BarChart3, color: 'bg-purple-100 text-purple-700', label: 'Poll' },
    announcement: { icon: Megaphone, color: 'bg-green-100 text-green-700', label: 'Announcement' },
    life_incident: { icon: Heart, color: 'bg-pink-100 text-pink-700', label: 'Life Event' },
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const renderPollContent = (activity: ActivityWithDetails) => {
    if (activity.type !== 'poll' || !activity.metadata) return null;
    
    try {
      const metadata = JSON.parse(activity.metadata);
      const options = metadata.options || [];
      
      return (
        <div className="mt-4 space-y-2">
          {options.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
              <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full opacity-0 hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm">{option}</span>
            </div>
          ))}
        </div>
      );
    } catch (error) {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-20 bg-slate-200 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Activities Yet</h3>
          <p className="text-muted-foreground">
            Admin activities will appear here once they're posted.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity) => {
        const config = activityTypeConfig[activity.type as keyof typeof activityTypeConfig];
        const Icon = config?.icon || MessageSquare;
        const isExpanded = expandedActivity === activity.id;

        return (
          <Card key={activity.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Activity Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start space-x-3">
                  {/* Admin Avatar */}
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={activity.admin.profileImageUrl} />
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {getInitials(activity.admin.firstName, activity.admin.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    {/* Meta Info */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-sm">
                        {activity.admin.firstName} {activity.admin.lastName}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {activity.admin.role}
                      </Badge>
                      <div className={`inline-flex p-1 rounded-full ${config?.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {config?.label}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(activity.createdAt))} ago
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2">{activity.title}</h3>

                    {/* Content */}
                    <div className="text-slate-700 whitespace-pre-wrap">
                      {activity.content}
                    </div>

                    {/* Poll Options */}
                    {renderPollContent(activity)}
                  </div>
                </div>
              </div>

              {/* Reactions */}
              <div className="px-6 pb-4">
                <ActivityReactions 
                  activityId={activity.id}
                  initialCounts={activity._count?.reactions || 0}
                />
              </div>

              {/* Stats & Actions */}
              <div className="px-6 py-3 bg-slate-50 border-t flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{activity._count?.comments || 0} comments</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{activity._count?.reactions || 0} reactions</span>
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {isExpanded ? 'Hide' : 'View'} Comments
                </Button>
              </div>

              {/* Comments Section */}
              {isExpanded && (
                <div className="border-t bg-white">
                  <ActivityComments 
                    activityId={activity.id}
                    onCommentAdded={() => {
                      // Could refetch activities to update comment count
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}