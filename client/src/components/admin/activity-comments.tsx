import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { insertActivityCommentSchema } from "@shared/schema";
import ActivityReactions from "./activity-reactions";
import { 
  Send, 
  MessageSquare, 
  Reply,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { z } from "zod";

const commentSchema = insertActivityCommentSchema.pick({
  content: true,
}).extend({
  activityId: z.string(),
  parentId: z.string().optional(),
});

type CommentInput = z.infer<typeof commentSchema>;

interface CommentWithDetails {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  user: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    appId?: string;
  };
  _count?: {
    reactions: number;
    replies: number;
  };
  replies?: CommentWithDetails[];
}

interface ActivityCommentsProps {
  activityId: string;
  onCommentAdded?: () => void;
}

export default function ActivityComments({ activityId, onCommentAdded }: ActivityCommentsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const queryKey = ['/api/admin/activities', activityId, 'comments'];

  const { data: comments = [], isLoading } = useQuery<CommentWithDetails[]>({
    queryKey,
  });

  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      activityId,
      content: '',
      parentId: undefined,
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (data: CommentInput) => {
      return await apiRequest('POST', `/api/admin/activities/${activityId}/comments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Comment Posted!",
        description: "Your comment has been added.",
      });
      form.reset({ activityId, content: '', parentId: undefined });
      setReplyingTo(null);
      onCommentAdded?.();
    },
    onError: (error) => {
      console.error('Comment error:', error);
      toast({
        title: "Comment Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CommentInput) => {
    if (replyingTo) {
      data.parentId = replyingTo;
    }
    commentMutation.mutate(data);
  };

  const toggleExpanded = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const renderComment = (comment: CommentWithDetails, isReply = false) => {
    const isExpanded = expandedComments.has(comment.id);
    const hasReplies = (comment._count?.replies || 0) > 0;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-12 border-l-2 border-slate-200 pl-4' : ''}`}>
        <div className="flex items-start space-x-3 py-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.user.profileImageUrl} />
            <AvatarFallback className="bg-primary text-white text-xs">
              {getInitials(comment.user.firstName, comment.user.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Comment Header */}
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm">
                {comment.user.firstName} {comment.user.lastName}
              </span>
              {comment.user.appId && (
                <span className="text-xs text-muted-foreground">
                  {comment.user.appId}
                </span>
              )}
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {formatDistanceToNow(new Date(comment.createdAt))} ago
              </div>
            </div>

            {/* Comment Content */}
            <div className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">
              {comment.content}
            </div>

            {/* Comment Actions */}
            <div className="flex items-center space-x-4">
              <ActivityReactions 
                activityId={activityId}
                commentId={comment.id}
                compact={true}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-muted-foreground"
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>

              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(comment.id)}
                  className="text-xs text-muted-foreground"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ChevronDown className="w-3 h-3 mr-1" />
                  )}
                  {comment._count?.replies} {comment._count?.replies === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-3">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder={`Reply to ${comment.user.firstName}...`}
                              className="min-h-[80px] text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={commentMutation.isPending}
                      >
                        {commentMutation.isPending ? 'Posting...' : 'Reply'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {isExpanded && comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  const topLevelComments = comments.filter(c => !c.parentId);

  return (
    <div className="p-6 space-y-6">
      {/* New Comment Form */}
      {user && !replyingTo && (
        <div className="space-y-4">
          <h4 className="font-medium flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Add a comment
          </h4>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={commentMutation.isPending}
                  className="min-w-[100px]"
                >
                  {commentMutation.isPending ? (
                    'Posting...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-1 divide-y divide-slate-100">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-16 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : topLevelComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          topLevelComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}