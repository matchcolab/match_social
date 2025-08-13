import {
  users,
  prompts,
  responses,
  comments,
  groups,
  groupMemberships,
  introductions,
  likes,
  type User,
  type UpsertUser,
  type Prompt,
  type InsertPrompt,
  type Response,
  type InsertResponse,
  type Comment,
  type InsertComment,
  type Group,
  type InsertGroup,
  type GroupMembership,
  type Introduction,
  type InsertIntroduction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Prompt operations
  getTodaysPrompt(): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getAllPrompts(): Promise<Prompt[]>;
  
  // Response operations
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesForPrompt(promptId: string): Promise<(Response & { user: User; likeCount: number; commentCount: number; isLikedByUser?: boolean })[]>;
  getResponseById(id: string): Promise<Response | undefined>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsForResponse(responseId: string): Promise<(Comment & { user: User })[]>;
  
  // Group operations
  getAllGroups(): Promise<(Group & { isJoined?: boolean })[]>;
  getGroupById(id: string): Promise<Group | undefined>;
  getUserGroups(userId: string): Promise<(Group & { role: string })[]>;
  joinGroup(userId: string, groupId: string): Promise<GroupMembership>;
  leaveGroup(userId: string, groupId: string): Promise<void>;
  
  // Introduction operations
  createIntroduction(introduction: InsertIntroduction): Promise<Introduction>;
  getUserIntroductions(userId: string): Promise<(Introduction & { requester: User; target: User })[]>;
  updateIntroductionStatus(id: string, status: 'accepted' | 'declined'): Promise<Introduction>;
  
  // Like operations
  toggleLike(userId: string, responseId?: string, commentId?: string): Promise<boolean>;
  
  // Statistics
  getCommunityStats(): Promise<{
    newResponses: number;
    introductions: number;
    activeGroups: number;
    onlineUsers: number;
  }>;

  // Admin operations
  getAdminStats(): Promise<{
    totalUsers: number;
    newUsersToday: number;
    activePrompts: number;
    totalResponses: number;
    pendingModeration: number;
    healthScore: number;
  }>;
  getAllUsers(): Promise<User[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  getModerationQueue(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getTodaysPrompt(): Promise<Prompt | undefined> {
    const [prompt] = await db
      .select()
      .from(prompts)
      .where(eq(prompts.isActive, true))
      .orderBy(desc(prompts.createdAt))
      .limit(1);
    return prompt;
  }

  async createPrompt(promptData: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db.insert(prompts).values(promptData).returning();
    return prompt;
  }

  async getAllPrompts(): Promise<Prompt[]> {
    return await db.select().from(prompts).orderBy(desc(prompts.createdAt));
  }

  async createResponse(responseData: InsertResponse): Promise<Response> {
    const [response] = await db.insert(responses).values(responseData).returning();
    
    // Update prompt response count
    await db
      .update(prompts)
      .set({ responseCount: sql`${prompts.responseCount} + 1` })
      .where(eq(prompts.id, responseData.promptId));
    
    return response;
  }

  async getResponsesForPrompt(promptId: string, userId?: string): Promise<(Response & { user: User; likeCount: number; commentCount: number; isLikedByUser?: boolean })[]> {
    const responsesWithUsers = await db
      .select({
        response: responses,
        user: users,
      })
      .from(responses)
      .innerJoin(users, eq(responses.userId, users.id))
      .where(eq(responses.promptId, promptId))
      .orderBy(desc(responses.createdAt));

    const result = [];
    for (const { response, user } of responsesWithUsers) {
      // Get like status if user is provided
      let isLikedByUser = false;
      if (userId) {
        const [like] = await db
          .select()
          .from(likes)
          .where(and(eq(likes.userId, userId), eq(likes.responseId, response.id)))
          .limit(1);
        isLikedByUser = !!like;
      }

      result.push({
        ...response,
        user,
        likeCount: response.likeCount,
        commentCount: response.commentCount,
        isLikedByUser,
      });
    }

    return result;
  }

  async getResponseById(id: string): Promise<Response | undefined> {
    const [response] = await db.select().from(responses).where(eq(responses.id, id));
    return response;
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    
    // Update response comment count
    await db
      .update(responses)
      .set({ commentCount: sql`${responses.commentCount} + 1` })
      .where(eq(responses.id, commentData.responseId));
    
    return comment;
  }

  async getCommentsForResponse(responseId: string): Promise<(Comment & { user: User })[]> {
    return await db
      .select({
        comment: comments,
        user: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.responseId, responseId))
      .orderBy(comments.createdAt)
      .then(results => results.map(({ comment, user }) => ({ ...comment, user })));
  }

  async getAllGroups(userId?: string): Promise<(Group & { isJoined?: boolean })[]> {
    const allGroups = await db.select().from(groups).orderBy(desc(groups.memberCount));
    
    if (!userId) {
      return allGroups.map(group => ({ ...group, isJoined: false }));
    }

    const userMemberships = await db
      .select({ groupId: groupMemberships.groupId })
      .from(groupMemberships)
      .where(eq(groupMemberships.userId, userId));
    
    const joinedGroupIds = new Set(userMemberships.map(m => m.groupId));
    
    return allGroups.map(group => ({
      ...group,
      isJoined: joinedGroupIds.has(group.id),
    }));
  }

  async getGroupById(id: string): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }

  async getUserGroups(userId: string): Promise<(Group & { role: string })[]> {
    return await db
      .select({
        group: groups,
        role: groupMemberships.role,
      })
      .from(groupMemberships)
      .innerJoin(groups, eq(groupMemberships.groupId, groups.id))
      .where(eq(groupMemberships.userId, userId))
      .then(results => results.map(({ group, role }) => ({ ...group, role: role || 'member' })));
  }

  async joinGroup(userId: string, groupId: string): Promise<GroupMembership> {
    const [membership] = await db
      .insert(groupMemberships)
      .values({ userId, groupId })
      .returning();
    
    // Update group member count
    await db
      .update(groups)
      .set({ memberCount: sql`${groups.memberCount} + 1` })
      .where(eq(groups.id, groupId));
    
    return membership;
  }

  async leaveGroup(userId: string, groupId: string): Promise<void> {
    await db
      .delete(groupMemberships)
      .where(and(
        eq(groupMemberships.userId, userId),
        eq(groupMemberships.groupId, groupId)
      ));
    
    // Update group member count
    await db
      .update(groups)
      .set({ memberCount: sql`${groups.memberCount} - 1` })
      .where(eq(groups.id, groupId));
  }

  async createIntroduction(introData: InsertIntroduction): Promise<Introduction> {
    const [introduction] = await db.insert(introductions).values(introData).returning();
    return introduction;
  }

  async getUserIntroductions(userId: string): Promise<(Introduction & { requester: User; target: User })[]> {
    return await db
      .select({
        introduction: introductions,
        requester: users,
        target: {
          id: sql`target_user.id`,
          firstName: sql`target_user.first_name`,
          lastName: sql`target_user.last_name`,
          profileImageUrl: sql`target_user.profile_image_url`,
        },
      })
      .from(introductions)
      .innerJoin(users, eq(introductions.requesterId, users.id))
      .innerJoin(sql`users AS target_user`, sql`introductions.target_id = target_user.id`)
      .where(eq(introductions.targetId, userId))
      .orderBy(desc(introductions.createdAt))
      .then(results => results.map(({ introduction, requester, target }) => ({
        ...introduction,
        requester,
        target: target as User,
      })));
  }

  async updateIntroductionStatus(id: string, status: 'accepted' | 'declined'): Promise<Introduction> {
    const [introduction] = await db
      .update(introductions)
      .set({ status, respondedAt: new Date() })
      .where(eq(introductions.id, id))
      .returning();
    return introduction;
  }

  async toggleLike(userId: string, responseId?: string, commentId?: string): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(
        eq(likes.userId, userId),
        responseId ? eq(likes.responseId, responseId) : sql`1=1`,
        commentId ? eq(likes.commentId, commentId) : sql`1=1`
      ))
      .limit(1);

    if (existingLike.length > 0) {
      // Remove like
      await db
        .delete(likes)
        .where(eq(likes.id, existingLike[0].id));
      
      // Update count
      if (responseId) {
        await db
          .update(responses)
          .set({ likeCount: sql`${responses.likeCount} - 1` })
          .where(eq(responses.id, responseId));
      } else if (commentId) {
        await db
          .update(comments)
          .set({ likeCount: sql`${comments.likeCount} - 1` })
          .where(eq(comments.id, commentId));
      }
      
      return false;
    } else {
      // Add like
      await db.insert(likes).values({ userId, responseId, commentId });
      
      // Update count
      if (responseId) {
        await db
          .update(responses)
          .set({ likeCount: sql`${responses.likeCount} + 1` })
          .where(eq(responses.id, responseId));
      } else if (commentId) {
        await db
          .update(comments)
          .set({ likeCount: sql`${comments.likeCount} + 1` })
          .where(eq(comments.id, commentId));
      }
      
      return true;
    }
  }

  async getCommunityStats(): Promise<{
    newResponses: number;
    introductions: number;
    activeGroups: number;
    onlineUsers: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [newResponsesCount] = await db
      .select({ count: count() })
      .from(responses)
      .where(sql`${responses.createdAt} >= ${today}`);
    
    const [introductionsCount] = await db
      .select({ count: count() })
      .from(introductions)
      .where(sql`${introductions.createdAt} >= ${today}`);
    
    const [activeGroupsCount] = await db
      .select({ count: count() })
      .from(groups)
      .where(sql`${groups.activeCount} > 0`);
    
    return {
      newResponses: newResponsesCount.count,
      introductions: introductionsCount.count,
      activeGroups: activeGroupsCount.count,
      onlineUsers: Math.floor(Math.random() * 20) + 40, // Simulated online count
    };
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    newUsersToday: number;
    activePrompts: number;
    totalResponses: number;
    pendingModeration: number;
    healthScore: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalUsersCount] = await db.select({ count: count() }).from(users);
    const [newUsersCount] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${today}`);
    
    const [activePromptsCount] = await db
      .select({ count: count() })
      .from(prompts)
      .where(eq(prompts.isActive, true));
    
    const [totalResponsesCount] = await db
      .select({ count: count() })
      .from(responses)
      .where(sql`${responses.createdAt} >= ${today}`);
    
    const [pendingModerationCount] = await db
      .select({ count: count() })
      .from(responses)
      .where(eq(responses.isModerated, false));
    
    return {
      totalUsers: totalUsersCount.count,
      newUsersToday: newUsersCount.count,
      activePrompts: activePromptsCount.count,
      totalResponses: totalResponsesCount.count,
      pendingModeration: pendingModerationCount.count,
      healthScore: 85, // Calculated based on community metrics
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createGroup(groupData: InsertGroup): Promise<Group> {
    const [group] = await db.insert(groups).values(groupData).returning();
    return group;
  }

  async getModerationQueue(): Promise<any[]> {
    const reports = await db
      .select({
        id: responses.id,
        content: responses.content,
        createdAt: responses.createdAt,
        reporterName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      })
      .from(responses)
      .leftJoin(users, eq(responses.userId, users.id))
      .where(eq(responses.isModerated, false))
      .orderBy(desc(responses.createdAt));
    
    return reports;
  }
}

export const storage = new DatabaseStorage();
