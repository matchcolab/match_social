import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateAppId } from "./utils";
import { signupSchema, socialProfileSchema, fullProfileSchema } from "@shared/schema";
import { CommunityWebSocket } from "./services/websocket";
import { moderateContent, analyzeSentiment, generateIntroductionContext } from "./services/openai";
import { insertResponseSchema, insertCommentSchema, insertIntroductionSchema } from "@shared/schema";

let websocketService: CommunityWebSocket;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Daily prompt routes
  app.get('/api/prompts/today', async (req, res) => {
    try {
      const prompt = await storage.getTodaysPrompt();
      res.json(prompt);
    } catch (error) {
      console.error("Error fetching today's prompt:", error);
      res.status(500).json({ message: "Failed to fetch prompt" });
    }
  });

  app.get('/api/prompts/:promptId/responses', async (req, res) => {
    try {
      const { promptId } = req.params;
      const userId = (req.user as any)?.claims?.sub;
      const responses = await storage.getResponsesForPrompt(promptId, userId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  // Response routes
  app.post('/api/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const responseData = insertResponseSchema.parse({
        ...req.body,
        userId,
      });

      // Moderate content using OpenAI
      const moderation = await moderateContent(responseData.content);
      const sentiment = await analyzeSentiment(responseData.content);

      if (!moderation.isApproved) {
        return res.status(400).json({
          message: "Content did not pass moderation",
          flaggedCategories: moderation.flaggedCategories,
        });
      }

      const response = await storage.createResponse({
        ...responseData,
        isModerated: true,
        moderationScore: Math.round(moderation.confidence * 100),
        sentimentScore: sentiment.rating,
      });

      // Broadcast new response via WebSocket
      if (websocketService) {
        const responseWithUser = await storage.getResponsesForPrompt(response.promptId);
        const newResponse = responseWithUser.find(r => r.id === response.id);
        if (newResponse) {
          websocketService.broadcastNewResponse(newResponse);
        }
      }

      res.json(response);
    } catch (error) {
      console.error("Error creating response:", error);
      res.status(500).json({ message: "Failed to create response" });
    }
  });

  // Signup route (public)
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const validation = signupSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues });
      }

      const userData = validation.data;
      const appId = generateAppId();

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      const user = await storage.createUser({
        ...userData,
        appId,
        onboardingStatus: 'account_created',
      });

      res.json({ message: "Account created successfully", appId: user.appId });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  // Onboarding routes
  app.post('/api/onboarding/social-profile', isAuthenticated, async (req, res) => {
    try {
      const validation = socialProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues });
      }

      const userId = (req.user as any)?.claims?.sub;
      const profileData = validation.data;

      await storage.updateUser(userId, {
        ...profileData,
        onboardingStatus: 'social_profile_completed',
      });

      res.json({ message: "Social profile completed" });
    } catch (error) {
      console.error("Social profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.post('/api/onboarding/full-profile', isAuthenticated, async (req, res) => {
    try {
      const validation = fullProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues });
      }

      const userId = (req.user as any)?.claims?.sub;
      const profileData = validation.data;

      await storage.updateUser(userId, {
        ...profileData,
        onboardingStatus: 'full_profile_completed',
      });

      res.json({ message: "Full profile completed" });
    } catch (error) {
      console.error("Full profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Comment routes
  app.get('/api/responses/:responseId/comments', async (req, res) => {
    try {
      const { responseId } = req.params;
      const comments = await storage.getCommentsForResponse(responseId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commentData = insertCommentSchema.parse({
        ...req.body,
        userId,
      });

      // Moderate comment content
      const moderation = await moderateContent(commentData.content);
      if (!moderation.isApproved) {
        return res.status(400).json({
          message: "Comment did not pass moderation",
          flaggedCategories: moderation.flaggedCategories,
        });
      }

      const comment = await storage.createComment({
        ...commentData,
        isModerated: true,
      });

      // Broadcast new comment via WebSocket
      if (websocketService) {
        const commentsWithUser = await storage.getCommentsForResponse(comment.responseId);
        const newComment = commentsWithUser.find(c => c.id === comment.id);
        if (newComment) {
          websocketService.broadcastNewComment(newComment);
        }
      }

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Like routes
  app.post('/api/likes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { responseId, commentId } = req.body;

      const isLiked = await storage.toggleLike(userId, responseId, commentId);
      
      // Get updated like count
      let likeCount = 0;
      if (responseId) {
        const response = await storage.getResponseById(responseId);
        likeCount = response?.likeCount || 0;
      }

      // Broadcast like update via WebSocket
      if (websocketService) {
        websocketService.broadcastLikeUpdate(responseId || commentId, likeCount, isLiked);
      }

      res.json({ isLiked, likeCount });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Group routes
  app.get('/api/groups', async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const groups = await storage.getAllGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get('/api/user/groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getUserGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      res.status(500).json({ message: "Failed to fetch user groups" });
    }
  });

  app.post('/api/groups/:groupId/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { groupId } = req.params;
      
      const membership = await storage.joinGroup(userId, groupId);
      res.json(membership);
    } catch (error) {
      console.error("Error joining group:", error);
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  app.delete('/api/groups/:groupId/leave', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { groupId } = req.params;
      
      await storage.leaveGroup(userId, groupId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving group:", error);
      res.status(500).json({ message: "Failed to leave group" });
    }
  });

  // Introduction routes
  app.get('/api/introductions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const introductions = await storage.getUserIntroductions(userId);
      res.json(introductions);
    } catch (error) {
      console.error("Error fetching introductions:", error);
      res.status(500).json({ message: "Failed to fetch introductions" });
    }
  });

  app.post('/api/introductions', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const introData = insertIntroductionSchema.parse({
        ...req.body,
        requesterId,
      });

      // Get user profiles for context generation
      const requester = await storage.getUser(requesterId);
      const target = await storage.getUser(introData.targetId);

      if (!requester || !target) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate enhanced introduction context using AI
      const enhancedMessage = await generateIntroductionContext(
        { name: `${requester.firstName} ${requester.lastName}`, bio: requester.bio },
        { name: `${target.firstName} ${target.lastName}`, bio: target.bio },
        introData.message || "",
        "shared community interest"
      );

      const introduction = await storage.createIntroduction({
        ...introData,
        message: enhancedMessage,
      });

      // Broadcast introduction request via WebSocket
      if (websocketService) {
        websocketService.broadcastIntroductionRequest(introData.targetId, {
          ...introduction,
          requester,
        });
      }

      res.json(introduction);
    } catch (error) {
      console.error("Error creating introduction:", error);
      res.status(500).json({ message: "Failed to create introduction" });
    }
  });

  app.patch('/api/introductions/:introId/status', isAuthenticated, async (req: any, res) => {
    try {
      const { introId } = req.params;
      const { status } = req.body;

      if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const introduction = await storage.updateIntroductionStatus(introId, status);
      res.json(introduction);
    } catch (error) {
      console.error("Error updating introduction status:", error);
      res.status(500).json({ message: "Failed to update introduction status" });
    }
  });

  // Profile update endpoint
  app.post('/api/profile/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const updatedUser = await storage.updateUser(userId, profileData);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Full profile update endpoint
  app.post('/api/profile/full-update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const updatedUser = await storage.updateUser(userId, profileData);
      
      res.json({
        success: true,
        message: 'Full profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating full profile:", error);
      res.status(500).json({ message: "Failed to update full profile" });
    }
  });

  // Community stats
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getCommunityStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching community stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin middleware to check admin role
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/prompts', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const prompts = await storage.getAllPrompts();
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  app.post('/api/admin/prompts', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const prompt = await storage.createPrompt(req.body);
      res.json(prompt);
    } catch (error) {
      console.error("Error creating prompt:", error);
      res.status(500).json({ message: "Failed to create prompt" });
    }
  });

  app.get('/api/admin/groups', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const groups = await storage.getAllGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post('/api/admin/groups', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const group = await storage.createGroup(req.body);
      res.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.get('/api/admin/moderation', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const reports = await storage.getModerationQueue();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching moderation queue:", error);
      res.status(500).json({ message: "Failed to fetch moderation queue" });
    }
  });

  // Generate unique App ID utility function
  function generateAppId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Step 1: Account creation with App ID assignment
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const signupData = req.body;
      
      // Generate unique App ID
      const appId = generateAppId();

      // Create user with minimal data and App ID
      const userData = {
        ...signupData,
        appId,
        onboardingStatus: 'account_created',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newUser = await storage.createUser(userData);
      
      res.json({
        success: true,
        message: 'Account created successfully',
        appId: newUser.appId,
        user: newUser
      });
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Step 2: Social profile completion
  app.post('/api/profile/social-update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = {
        ...req.body,
        onboardingStatus: 'social_profile_complete',
        updatedAt: new Date(),
      };
      
      const updatedUser = await storage.updateUser(userId, profileData);
      
      res.json({
        success: true,
        message: 'Social profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating social profile:", error);
      res.status(500).json({ message: "Failed to update social profile" });
    }
  });

  const httpServer = createServer(app);

  // Initialize WebSocket service
  websocketService = new CommunityWebSocket(httpServer);

  return httpServer;
}
