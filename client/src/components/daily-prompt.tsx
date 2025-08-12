import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Lightbulb, Heart, Image, Smile } from "lucide-react";
import type { Prompt, User } from "@shared/schema";

interface DailyPromptProps {
  user: User;
}

export default function DailyPrompt({ user }: DailyPromptProps) {
  const [response, setResponse] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: prompt, isLoading } = useQuery<Prompt>({
    queryKey: ["/api/prompts/today"],
  });

  const createResponseMutation = useMutation({
    mutationFn: async (data: { content: string; promptId: string }) => {
      return await apiRequest("POST", "/api/responses", data);
    },
    onSuccess: () => {
      setResponse("");
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({
        title: "Response shared!",
        description: "Your response has been shared with the community.",
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
        description: "Failed to share response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!response.trim() || !prompt) return;
    
    createResponseMutation.mutate({
      content: response.trim(),
      promptId: prompt.id,
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <section className="bg-white border-b border-slate-200 p-4 lg:p-6">
        <div className="animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!prompt) {
    return (
      <section className="bg-white border-b border-slate-200 p-4 lg:p-6">
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-secondary">No daily prompt available right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border-b border-slate-200 p-4 lg:p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-lg font-semibold text-slate-800">Today's Prompt</h2>
            <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">New</span>
          </div>
          
          <h3 className="text-xl font-medium text-slate-800 mb-3">
            {prompt.title}
          </h3>
          
          <div className="flex items-center space-x-4 text-sm text-secondary mb-4">
            <span>{prompt.responseCount || 0} responses</span>
            <span className="flex items-center space-x-1">
              <Heart className="h-4 w-4 text-red-400" />
              <span>{prompt.likeCount || 0}</span>
            </span>
          </div>
          
          {/* Quick Response Input */}
          <div className="space-y-3">
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profileImageUrl || ""} alt="Your profile" />
                <AvatarFallback className="bg-primary text-white">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea 
                  placeholder="Share your story..." 
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="resize-none border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-4 text-sm text-secondary">
                    <Button variant="ghost" size="sm" className="p-0 h-auto text-secondary hover:text-slate-600">
                      <Image className="h-4 w-4 mr-1" />
                      Photo
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-auto text-secondary hover:text-slate-600">
                      <Smile className="h-4 w-4 mr-1" />
                      Feeling
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!response.trim() || createResponseMutation.isPending}
                    className="px-4 py-2 font-medium"
                  >
                    {createResponseMutation.isPending ? "Sharing..." : "Share"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
