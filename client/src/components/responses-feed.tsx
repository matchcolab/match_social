import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ResponseItem from "./response-item";
import type { Response, User } from "@shared/schema";

interface ResponsesFeedProps {
  userId: string;
}

type ResponseWithUser = Response & { 
  user: User; 
  likeCount: number; 
  commentCount: number; 
  isLikedByUser?: boolean;
};

export default function ResponsesFeed({ userId }: ResponsesFeedProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  const { data: todaysPrompt } = useQuery<{ id: string }>({
    queryKey: ["/api/prompts/today"],
  });

  const promptId = selectedPromptId || todaysPrompt?.id;

  const { data: responses = [], isLoading } = useQuery<ResponseWithUser[]>({
    queryKey: ["/api/prompts", promptId, "responses"],
    enabled: !!promptId,
  });

  if (isLoading) {
    return (
      <section className="divide-y divide-slate-200">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-4 lg:p-6 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-4 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <div className="h-4 bg-slate-200 rounded w-12"></div>
                    <div className="h-4 bg-slate-200 rounded w-12"></div>
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (responses.length === 0) {
    return (
      <section className="bg-white border-b border-slate-200 p-4 lg:p-6">
        <div className="text-center py-8">
          <p className="text-secondary mb-2">No responses yet for today's prompt.</p>
          <p className="text-sm text-slate-500">Be the first to share your thoughts!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="divide-y divide-slate-200">
      {responses.map((response) => (
        <ResponseItem 
          key={response.id} 
          response={response} 
          currentUserId={userId}
        />
      ))}
    </section>
  );
}
