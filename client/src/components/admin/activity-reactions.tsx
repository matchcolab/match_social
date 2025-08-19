import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  ThumbsUp,
  Heart,
  Handshake,
  Lightbulb,
  PartyPopper,
  Smile,
  ThumbsDown
} from "lucide-react";

const reactionTypes = [
  { type: 'like', emoji: '👍', icon: ThumbsUp, label: 'Like', color: 'text-blue-600 bg-blue-100' },
  { type: 'love', emoji: '❤️', icon: Heart, label: 'Love', color: 'text-red-600 bg-red-100' },
  { type: 'support', emoji: '🤝', icon: Handshake, label: 'Support', color: 'text-green-600 bg-green-100' },
  { type: 'insightful', emoji: '💡', icon: Lightbulb, label: 'Insightful', color: 'text-yellow-600 bg-yellow-100' },
  { type: 'celebrate', emoji: '🎉', icon: PartyPopper, label: 'Celebrate', color: 'text-purple-600 bg-purple-100' },
  { type: 'funny', emoji: '😄', icon: Smile, label: 'Funny', color: 'text-orange-600 bg-orange-100' },
  { type: 'disagree', emoji: '👎', icon: ThumbsDown, label: 'Disagree', color: 'text-gray-600 bg-gray-100' },
];

interface ActivityReactionsProps {
  activityId: string;
  commentId?: string;
  initialCounts?: number;
  compact?: boolean;
}

interface ReactionData {
  type: string;
  count: number;
  hasUserReacted: boolean;
}

export default function ActivityReactions({ 
  activityId, 
  commentId, 
  initialCounts = 0, 
  compact = false 
}: ActivityReactionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAllReactions, setShowAllReactions] = useState(false);

  const queryKey = commentId 
    ? ['/api/activity-comments', commentId, 'reactions']
    : ['/api/admin/activities', activityId, 'reactions'];

  const { data: reactions = [] } = useQuery<ReactionData[]>({
    queryKey,
  });

  const reactionMutation = useMutation({
    mutationFn: async ({ reactionType, action }: { reactionType: string; action: 'add' | 'remove' }) => {
      const endpoint = commentId 
        ? `/api/activity-comments/${commentId}/reactions`
        : `/api/admin/activities/${activityId}/reactions`;
      
      if (action === 'add') {
        return await apiRequest('POST', endpoint, { reactionType });
      } else {
        return await apiRequest('DELETE', `${endpoint}/${reactionType}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('Reaction error:', error);
      toast({
        title: "Reaction Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleReaction = (reactionType: string) => {
    if (!user) return;

    const existingReaction = reactions.find(r => r.type === reactionType);
    const action = existingReaction?.hasUserReacted ? 'remove' : 'add';
    
    reactionMutation.mutate({ reactionType, action });
  };

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  const topReactions = reactions
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, compact ? 3 : 7);

  if (compact && totalReactions === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        {/* Reaction Summary */}
        {topReactions.length > 0 && (
          <div className="flex items-center space-x-1">
            {topReactions.map((reaction) => {
              const reactionConfig = reactionTypes.find(rt => rt.type === reaction.type);
              if (!reactionConfig) return null;

              return (
                <Tooltip key={reaction.type}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleReaction(reaction.type)}
                      disabled={reactionMutation.isPending}
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        reaction.hasUserReacted
                          ? reactionConfig.color
                          : 'text-muted-foreground bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <span>{reactionConfig.emoji}</span>
                      <span>{reaction.count}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{reactionConfig.label} ({reaction.count})</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            
            {totalReactions > (compact ? 3 : 7) && (
              <span className="text-xs text-muted-foreground">
                +{totalReactions - (compact ? 3 : 7)} more
              </span>
            )}
          </div>
        )}

        {/* Reaction Panel Toggle */}
        {!compact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllReactions(!showAllReactions)}
            className="text-xs"
          >
            {showAllReactions ? 'Hide' : 'React'}
          </Button>
        )}

        {/* Full Reaction Panel */}
        {showAllReactions && !compact && (
          <div className="flex items-center space-x-1 p-2 bg-white border rounded-lg shadow-lg">
            {reactionTypes.map((reactionType) => {
              const existingReaction = reactions.find(r => r.type === reactionType.type);
              const hasUserReacted = existingReaction?.hasUserReacted || false;

              return (
                <Tooltip key={reactionType.type}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleReaction(reactionType.type)}
                      disabled={reactionMutation.isPending}
                      className={`p-2 rounded-full transition-all hover:scale-110 ${
                        hasUserReacted
                          ? reactionType.color
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{reactionType.emoji}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{reactionType.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}