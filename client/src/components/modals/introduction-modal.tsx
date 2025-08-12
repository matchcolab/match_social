import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";

interface IntroductionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  targetUser?: User;
  contextMessage?: string;
}

export default function IntroductionModal({ 
  isOpen = false, 
  onClose = () => {}, 
  targetUser,
  contextMessage = ""
}: IntroductionModalProps) {
  const [message, setMessage] = useState(contextMessage);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const introductionMutation = useMutation({
    mutationFn: async (data: { targetId: string; message: string }) => {
      return await apiRequest("POST", "/api/introductions", data);
    },
    onSuccess: () => {
      setMessage("");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/introductions"] });
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

  const handleSubmit = () => {
    if (!targetUser || !message.trim()) return;
    
    introductionMutation.mutate({
      targetId: targetUser.id,
      message: message.trim(),
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Introduction</DialogTitle>
        </DialogHeader>
        
        {targetUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={targetUser.profileImageUrl || ""} alt={`${targetUser.firstName}'s profile`} />
                <AvatarFallback className="bg-primary text-white">
                  {getInitials(targetUser.firstName, targetUser.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-800">
                  {targetUser.firstName} {targetUser.lastName}
                </p>
                <p className="text-sm text-secondary">
                  {[targetUser.age && `${targetUser.age}`, targetUser.location].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Why would you like to connect?
              </label>
              <Textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
                rows={3}
                placeholder="Share what you have in common or what caught your interest..."
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={onClose}
                disabled={introductionMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleSubmit}
                disabled={!message.trim() || introductionMutation.isPending}
              >
                {introductionMutation.isPending ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
