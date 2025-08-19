import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertAdminActivitySchema } from "@shared/schema";
import { 
  Send, 
  Plus, 
  X, 
  MessageSquare, 
  BarChart3, 
  Megaphone, 
  Heart,
  Lightbulb 
} from "lucide-react";
import { z } from "zod";

const activitySchema = insertAdminActivitySchema.pick({
  type: true,
  title: true,
  content: true,
}).extend({
  pollOptions: z.array(z.string()).optional(),
});

type ActivityInput = z.infer<typeof activitySchema>;

const activityTypes = [
  { 
    value: 'question', 
    label: 'Question', 
    icon: MessageSquare, 
    color: 'bg-blue-100 text-blue-700',
    description: 'Ask the community for thoughts and opinions'
  },
  { 
    value: 'poll', 
    label: 'Poll', 
    icon: BarChart3, 
    color: 'bg-purple-100 text-purple-700',
    description: 'Create a poll for community voting'
  },
  { 
    value: 'announcement', 
    label: 'Announcement', 
    icon: Megaphone, 
    color: 'bg-green-100 text-green-700',
    description: 'Share important news or updates'
  },
  { 
    value: 'life_incident', 
    label: 'Life Event', 
    icon: Heart, 
    color: 'bg-pink-100 text-pink-700',
    description: 'Share personal stories or life experiences'
  },
];

interface ActivityComposerProps {
  onActivityCreated?: () => void;
}

export default function ActivityComposer({ onActivityCreated }: ActivityComposerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const form = useForm<ActivityInput>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: 'question',
      title: '',
      content: '',
      pollOptions: ['', ''],
    },
  });

  const selectedType = form.watch('type');
  const isPoll = selectedType === 'poll';

  const createActivityMutation = useMutation({
    mutationFn: async (data: ActivityInput) => {
      const payload = {
        ...data,
        metadata: isPoll ? JSON.stringify({ options: data.pollOptions?.filter(Boolean) }) : null,
      };
      return await apiRequest('POST', '/api/admin/activities', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activities'] });
      toast({
        title: "Activity Posted!",
        description: "Your activity has been shared with the community.",
      });
      form.reset();
      setPollOptions(['', '']);
      setIsExpanded(false);
      onActivityCreated?.();
    },
    onError: (error) => {
      console.error('Activity creation error:', error);
      toast({
        title: "Failed to Post",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ActivityInput) => {
    if (isPoll) {
      const validOptions = pollOptions.filter(Boolean);
      if (validOptions.length < 2) {
        toast({
          title: "Poll Error",
          description: "Please add at least 2 poll options.",
          variant: "destructive",
        });
        return;
      }
      data.pollOptions = validOptions;
    }
    createActivityMutation.mutate(data);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const selectedTypeData = activityTypes.find(t => t.value === selectedType);

  if (!isExpanded) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <Button 
            onClick={() => setIsExpanded(true)}
            variant="outline" 
            className="w-full justify-start text-muted-foreground"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Share something with the community...
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Create Community Activity</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setIsExpanded(false);
              form.reset();
              setPollOptions(['', '']);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Activity Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {activityTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = field.value === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => field.onChange(type.value)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-center space-y-2">
                            <div className={`inline-flex p-2 rounded-full ${type.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="text-sm font-medium">{type.label}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedTypeData && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedTypeData.description}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={
                        selectedType === 'poll' ? 'What should we vote on?' :
                        selectedType === 'question' ? 'What would you like to ask?' :
                        selectedType === 'announcement' ? 'Important announcement' :
                        'Share your experience...'
                      }
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share more details, context, or your thoughts..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Poll Options */}
            {isPoll && (
              <div className="space-y-3">
                <FormLabel>Poll Options</FormLabel>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      className="flex-1"
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePollOption(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPollOption}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createActivityMutation.isPending}
                className="min-w-[120px]"
              >
                {createActivityMutation.isPending ? (
                  "Posting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Activity
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}