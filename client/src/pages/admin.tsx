import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Users, 
  MessageSquare, 
  Shield, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  Crown
} from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is admin
  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <Badge variant="outline" className="text-primary">
              Administrator
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersTab />
          </TabsContent>

          <TabsContent value="prompts" className="space-y-6">
            <PromptsTab />
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <GroupsTab />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <ModerationTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewTab() {
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          <p className="text-xs text-muted-foreground">
            +{stats?.newUsersToday || 0} today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Prompts</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activePrompts || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.totalResponses || 0} responses today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Moderation Queue</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.pendingModeration || 0}</div>
          <p className="text-xs text-muted-foreground">
            Items awaiting review
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Community Health</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.healthScore || 0}%</div>
          <p className="text-xs text-muted-foreground">
            Based on engagement & sentiment
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab() {
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user accounts, verification, and roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users && users.length > 0 ? (
            users.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img 
                    src={user.profileImageUrl || '/placeholder-avatar.png'} 
                    alt={user.firstName || 'User'}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.isVerified && (
                    <Badge variant="outline" className="text-green-600">
                      Verified
                    </Badge>
                  )}
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p>No users found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PromptsTab() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    title: "",
    content: "",
    type: "daily"
  });

  const { data: prompts } = useQuery({
    queryKey: ["/api/admin/prompts"],
  });

  const createPromptMutation = useMutation({
    mutationFn: async (prompt: any) => {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt),
      });
      if (!response.ok) throw new Error('Failed to create prompt');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompts"] });
      setShowCreateForm(false);
      setNewPrompt({ title: "", content: "", type: "daily" });
      toast({
        title: "Success",
        description: "Prompt created successfully",
      });
    },
  });

  const handleCreatePrompt = () => {
    createPromptMutation.mutate(newPrompt);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daily Prompts</CardTitle>
            <CardDescription>Create and manage community prompts</CardDescription>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </Button>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPrompt.title}
                    onChange={(e) => setNewPrompt({...newPrompt, title: e.target.value})}
                    placeholder="What's your prompt title?"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newPrompt.content}
                    onChange={(e) => setNewPrompt({...newPrompt, content: e.target.value})}
                    placeholder="Describe the prompt..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newPrompt.type} onValueChange={(value) => setNewPrompt({...newPrompt, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="values">Values</SelectItem>
                      <SelectItem value="perspective">Perspective</SelectItem>
                      <SelectItem value="show_tell">Show & Tell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreatePrompt} disabled={createPromptMutation.isPending}>
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {prompts && prompts.length > 0 ? (
              prompts.map((prompt: any) => (
                <div key={prompt.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{prompt.title}</h3>
                    <p className="text-sm text-muted-foreground">{prompt.content}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{prompt.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {prompt.responseCount} responses
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p>No prompts found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GroupsTab() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    isPublic: true
  });

  const { data: groups } = useQuery({
    queryKey: ["/api/admin/groups"],
  });

  const createGroupMutation = useMutation({
    mutationFn: async (group: any) => {
      const response = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group),
      });
      if (!response.ok) throw new Error('Failed to create group');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/groups"] });
      setShowCreateForm(false);
      setNewGroup({ name: "", description: "", isPublic: true });
      toast({
        title: "Success",
        description: "Group created successfully",
      });
    },
  });

  const handleCreateGroup = () => {
    createGroupMutation.mutate(newGroup);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Community Groups</CardTitle>
            <CardDescription>Create and manage interest-based groups</CardDescription>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    placeholder="Describe the group purpose..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreateGroup} disabled={createGroupMutation.isPending}>
                    Create Group
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {groups && groups.length > 0 ? (
              groups.map((group: any) => (
                <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={group.isPublic ? "outline" : "secondary"}>
                        {group.isPublic ? "Public" : "Private"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {group.memberCount} members
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p>No groups found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ModerationTab() {
  const { data: reports } = useQuery({
    queryKey: ["/api/admin/moderation"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Moderation</CardTitle>
        <CardDescription>Review flagged content and moderation reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports && reports.length > 0 ? (
            reports.map((report: any) => (
              <div key={report.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">Flagged Response</h4>
                    <p className="text-sm text-muted-foreground">
                      Reported by {report.reporterName} • {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="destructive">Pending Review</Badge>
                </div>
                <p className="text-sm mb-3 p-3 bg-muted rounded">{report.content}</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-green-600">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    Remove
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p>No moderation reports found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}