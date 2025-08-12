import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Heart, MessageCircle, Share, Handshake, Shield } from "lucide-react";
import type { Response, User, Comment } from "@shared/schema";

interface ResponseItemProps {
  response: Response & { 
    user: User; 
    likeCount: number; 
    commentCount: number; 
    isLikedByUser?: boolean;
  };
  currentUserId: string;
}

export default function ResponseItem({ response, currentUserId }: ResponseItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(response.isLikedByUser || false);
  const [likeCount, setLikeCount] = useState(response.likeCount);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery<(Comment & { user: User })[]>({
    queryKey: ["/api/responses", response.id, "comments"],
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/likes", { responseId: response.id });
    },
    onSuccess: (data: { isLiked: boolean; likeCount: number }) => {
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
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
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  const introductionMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("POST", "/api/introductions", {
        targetId: response.userId,
        message,
        contextResponseId: response.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Introduction requested!",
        description: "Your introduction request has been sent.",
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
        description: "Failed to send introduction request.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleIntroductionRequest = () => {
    if (response.userId === currentUserId) {
      toast({
        title: "Cannot request introduction",
        description: "You cannot request an introduction to yourself.",
      });
      return;
    }

    const message = `I found your response about "${response.content.substring(0, 50)}..." really insightful and would love to connect!`;
    introductionMutation.mutate(message);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <article className="bg-white p-4 lg:p-6 hover:bg-slate-50 transition-colors">
      <div className="flex space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={response.user.profileImageUrl || ""} alt={`${response.user.firstName}'s profile`} />
          <AvatarFallback className="bg-primary text-white">
            {getInitials(response.user.firstName, response.user.lastName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-slate-800">
              {response.user.firstName} {response.user.lastName}
            </h4>
            {response.user.age && (
              <span className="text-sm text-secondary">{response.user.age}</span>
            )}
            {response.user.location && (
              <span className="text-sm text-secondary">• {response.user.location}</span>
            )}
            {response.user.isVerified && (
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3 text-accent" />
                <span className="text-xs text-accent">Verified</span>
              </div>
            )}
            <span className="text-xs text-secondary">
              {formatTimeAgo(response.createdAt)}
            </span>
          </div>
          
          <p className="text-slate-700 mb-3 leading-relaxed">
            {response.content}
          </p>

          {response.imageUrl && (
            <div className="mb-3">
              <img 
                src={response.imageUrl} 
                alt="Response attachment" 
                className="rounded-lg w-full max-w-md h-48 object-cover"
              />
            </div>
          )}
          
          {/* Response Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`text-sm transition-colors ${
                  isLiked ? "text-red-500 hover:text-red-600" : "text-secondary hover:text-red-500"
                }`}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                {likeCount}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-sm text-secondary hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {response.commentCount}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-sm text-secondary hover:text-accent transition-colors"
              >
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            
            {/* Premium Introduction Request */}
            {response.userId !== currentUserId && (
              <Button 
                size="sm"
                onClick={handleIntroductionRequest}
                disabled={introductionMutation.isPending}
                className="bg-gradient-to-r from-primary to-accent text-white hover:shadow-md transition-all"
              >
                <Handshake className="h-4 w-4 mr-1" />
                {introductionMutation.isPending ? "Sending..." : "Request Introduction"}
              </Button>
            )}
          </div>
          
          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.profileImageUrl || ""} />
                      <AvatarFallback className="bg-secondary text-white text-xs">
                        {getInitials(comment.user.firstName, comment.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-slate-100 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-slate-800">
                            {comment.user.firstName} {comment.user.lastName}
                          </span>
                          <span className="text-xs text-secondary">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-secondary text-sm py-4">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
