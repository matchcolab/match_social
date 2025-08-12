import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import MobileBottomNav from "@/components/layout/mobile-bottom-nav";
import RightSidebar from "@/components/layout/right-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Compass, 
  Search, 
  TrendingUp, 
  Users, 
  Heart,
  MessageCircle,
  Filter,
  Star,
  MapPin
} from "lucide-react";

export default function Discover() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { onlineCount } = useWebSocket(user?.id);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery<{
    newResponses: number;
    introductions: number;
    activeGroups: number;
    onlineUsers: number;
  }>({
    queryKey: ["/api/stats"],
  });

  // Mock data for trending topics and active members
  const trendingTopics = [
    { name: "Mindfulness & Meditation", count: 47, growth: "+12%" },
    { name: "Weekend Adventures", count: 38, growth: "+8%" },
    { name: "Professional Growth", count: 31, growth: "+15%" },
    { name: "Creative Writing", count: 24, growth: "+5%" },
    { name: "Local Food Scene", count: 19, growth: "+22%" },
  ];

  const featuredMembers = [
    {
      id: "1",
      firstName: "Alex",
      lastName: "Thompson",
      age: 28,
      location: "San Francisco",
      title: "UX Designer",
      bio: "Passionate about human-centered design and mindful living",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      recentActivity: "Shared thoughts on remote work culture",
      isVerified: true,
    },
    {
      id: "2", 
      firstName: "Maya",
      lastName: "Patel",
      age: 32,
      location: "Seattle",
      title: "Software Engineer",
      bio: "Love hiking, photography, and building meaningful connections",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      recentActivity: "Started a discussion about work-life balance",
      isVerified: true,
    },
    {
      id: "3",
      firstName: "Jordan",
      lastName: "Miller",
      age: 26,
      location: "Portland",
      title: "Creative Writer",
      bio: "Storyteller seeking fellow creatives and deep conversations",
      profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      recentActivity: "Posted about finding inspiration in everyday moments",
      isVerified: false,
    },
  ];

  const activeDiscussions = [
    {
      id: "1",
      title: "What's your favorite way to practice gratitude?",
      author: "Sarah Chen",
      replies: 23,
      likes: 45,
      timeAgo: "2h ago",
      tags: ["gratitude", "mindfulness", "wellbeing"]
    },
    {
      id: "2",
      title: "Best local spots for weekend adventures?",
      author: "Mike Rodriguez", 
      replies: 18,
      likes: 32,
      timeAgo: "4h ago",
      tags: ["adventure", "local", "weekend"]
    },
    {
      id: "3",
      title: "How do you maintain friendships as an adult?",
      author: "Emma Johnson",
      replies: 31,
      likes: 67,
      timeAgo: "6h ago", 
      tags: ["friendship", "relationships", "adulting"]
    },
  ];

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading discovery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background font-sans text-slate-800 antialiased">
      {/* Mobile Header */}
      <MobileHeader onlineCount={onlineCount} />

      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <Sidebar user={user} onlineCount={onlineCount} />

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="max-w-6xl mx-auto p-4 lg:p-6">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <Compass className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-slate-800">Discover</h1>
              </div>
              <p className="text-secondary">Explore trending topics, find interesting people, and join meaningful conversations</p>
            </div>

            {/* Search and Filters */}
            <div className="flex space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
                <Input 
                  placeholder="Search topics, people, or discussions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-200"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Community Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{stats?.onlineUsers || 47}</div>
                  <div className="text-sm text-secondary">Online Now</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-1">{stats?.newResponses || 127}</div>
                  <div className="text-sm text-secondary">New Posts Today</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{stats?.activeGroups || 23}</div>
                  <div className="text-sm text-secondary">Active Groups</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-1">{stats?.introductions || 18}</div>
                  <div className="text-sm text-secondary">Introductions Today</div>
                </CardContent>
              </Card>
            </div>

            {/* Discovery Tabs */}
            <Tabs defaultValue="trending" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trending">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="people">
                  <Users className="h-4 w-4 mr-2" />
                  People
                </TabsTrigger>
                <TabsTrigger value="discussions">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Discussions
                </TabsTrigger>
              </TabsList>

              {/* Trending Topics */}
              <TabsContent value="trending">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <span>Trending Topics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {trendingTopics.map((topic, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                          <div>
                            <h4 className="font-medium text-slate-800">{topic.name}</h4>
                            <p className="text-sm text-secondary">{topic.count} conversations</p>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {topic.growth}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Featured People */}
              <TabsContent value="people">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredMembers.map((member) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={member.profileImageUrl} />
                            <AvatarFallback className="bg-primary text-white">
                              {member.firstName[0]}{member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-slate-800">
                                {member.firstName} {member.lastName}
                              </h3>
                              {member.isVerified && (
                                <Badge variant="outline" className="text-xs text-accent border-accent">
                                  <Star className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-secondary mb-2">
                              <span>{member.title}</span>
                              <span>•</span>
                              <span>{member.age}</span>
                              <MapPin className="w-3 h-3" />
                              <span>{member.location}</span>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                              {member.bio}
                            </p>
                            
                            <div className="text-xs text-secondary mb-3 p-2 bg-blue-50 rounded border-l-2 border-primary">
                              Recent: {member.recentActivity}
                            </div>
                            
                            <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white">
                              <Heart className="w-4 h-4 mr-2" />
                              Request Introduction
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Active Discussions */}
              <TabsContent value="discussions">
                <div className="space-y-4">
                  {activeDiscussions.map((discussion) => (
                    <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <h3 className="text-lg font-medium text-slate-800 hover:text-primary transition-colors">
                            {discussion.title}
                          </h3>
                          
                          <div className="flex items-center space-x-4 text-sm text-secondary">
                            <span>by {discussion.author}</span>
                            <span>•</span>
                            <span>{discussion.timeAgo}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {discussion.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1 text-sm text-secondary">
                                <MessageCircle className="w-4 h-4" />
                                <span>{discussion.replies}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-secondary">
                                <Heart className="w-4 h-4" />
                                <span>{discussion.likes}</span>
                              </div>
                            </div>
                            
                            <Button size="sm" variant="outline">
                              Join Discussion
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Right Sidebar - Desktop Only */}
        <RightSidebar userId={user.id} />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
