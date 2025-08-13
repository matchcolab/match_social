import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'non_binary', 'prefer_not_to_say']);
export const maritalStatusEnum = pgEnum('marital_status', ['single_never_married', 'divorced', 'separated_filed', 'separated_not_filed', 'married']);
export const onboardingStatusEnum = pgEnum('onboarding_status', ['account_created', 'social_profile_completed', 'full_profile_completed', 'verified', 'subscribed']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").unique(), // 6-character unique identifier
  email: varchar("email").unique(),
  countryCode: varchar("country_code"),
  mobileNumber: varchar("mobile_number"),
  
  // Basic Profile
  firstName: varchar("first_name"),
  middleName: varchar("middle_name"),
  lastName: varchar("last_name"),
  gender: genderEnum("gender"),
  dateOfBirth: timestamp("date_of_birth"),
  height: integer("height"), // in cm
  maritalStatus: maritalStatusEnum("marital_status"),
  hasChildren: boolean("has_children").default(false),
  faith: varchar("faith"),
  
  // Location
  country: varchar("country"),
  state: varchar("state"),
  city: varchar("city"),
  location: varchar("location"),
  nationality: varchar("nationality"),
  
  // Social Profile
  personalIntro: text("personal_intro"),
  profileImageUrl: varchar("profile_image_url"),
  instagramUrl: varchar("instagram_url"),
  facebookUrl: varchar("facebook_url"),
  linkedinUrl: varchar("linkedin_url"),
  
  // Lifestyle & Habits
  smoking: varchar("smoking"), // never, occasionally, regularly
  drinking: varchar("drinking"), // never, socially, regularly
  diet: varchar("diet"), // vegetarian, non_vegetarian, vegan, etc
  workout: varchar("workout"), // never, occasionally, regularly
  interests: text("interests"),
  languages: text("languages"), // JSON array
  
  // Professional Details
  education: varchar("education"),
  degree: varchar("degree"),
  institution: varchar("institution"),
  professionalIntro: text("professional_intro"),
  industry: varchar("industry"),
  currency: varchar("currency"),
  incomeRange: varchar("income_range"),
  
  // Documents
  idDocumentType: varchar("id_document_type"),
  idDocumentNumber: varchar("id_document_number"),
  
  // Match Preferences
  preferredAgeMin: integer("preferred_age_min"),
  preferredAgeMax: integer("preferred_age_max"),
  preferredHeightMin: integer("preferred_height_min"),
  preferredHeightMax: integer("preferred_height_max"),
  preferredSmoking: varchar("preferred_smoking"),
  preferredDrinking: varchar("preferred_drinking"),
  preferredFaith: varchar("preferred_faith"),
  preferredMaritalStatus: varchar("preferred_marital_status"),
  willingToRelocate: boolean("willing_to_relocate").default(false),
  acceptSingleParent: boolean("accept_single_parent").default(false),
  additionalPreferences: text("additional_preferences"),
  
  // About Me
  bio: text("bio"),
  familyDetails: text("family_details"),
  healthConcerns: text("health_concerns"),
  photoUrls: text("photo_urls"), // JSON array of up to 5 images
  
  // Profile Visibility
  profileVisibility: varchar("profile_visibility").default('public'), // public, private, contacts_only
  publicProfileFields: text("public_profile_fields"), // JSON array of fields to show publicly
  
  // System fields
  role: userRoleEnum("role").default('user'),
  onboardingStatus: onboardingStatusEnum("onboarding_status").default('account_created'),
  isVerified: boolean("is_verified").default(false),
  isSubscribed: boolean("is_subscribed").default(false),
  trustScore: integer("trust_score").default(0),
  termsAccepted: boolean("terms_accepted").default(false),
  privacyAccepted: boolean("privacy_accepted").default(false),
  guidelinesAccepted: boolean("guidelines_accepted").default(false),
  verificationCallCompleted: boolean("verification_call_completed").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily prompts
export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").notNull().default('daily'), // daily, values, perspective, show_tell
  isActive: boolean("is_active").default(true),
  responseCount: integer("response_count").default(0),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// User responses to prompts
export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  promptId: varchar("prompt_id").references(() => prompts.id).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  isModerated: boolean("is_moderated").default(false),
  moderationScore: integer("moderation_score"),
  sentimentScore: integer("sentiment_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments on responses
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  responseId: varchar("response_id").references(() => responses.id).notNull(),
  content: text("content").notNull(),
  likeCount: integer("like_count").default(0),
  isModerated: boolean("is_moderated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Groups
export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  memberCount: integer("member_count").default(0),
  activeCount: integer("active_count").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Group memberships
export const groupMemberships = pgTable("group_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  groupId: varchar("group_id").references(() => groups.id).notNull(),
  role: varchar("role").default('member'), // member, moderator, admin
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Introduction requests
export const introductionStatusEnum = pgEnum('introduction_status', ['pending', 'accepted', 'declined', 'completed']);

export const introductions = pgTable("introductions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  targetId: varchar("target_id").references(() => users.id).notNull(),
  message: text("message"),
  status: introductionStatusEnum("status").default('pending'),
  contextResponseId: varchar("context_response_id").references(() => responses.id),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Likes on responses
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  responseId: varchar("response_id").references(() => responses.id),
  commentId: varchar("comment_id").references(() => comments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  responses: many(responses),
  comments: many(comments),
  groupMemberships: many(groupMemberships),
  sentIntroductions: many(introductions, { relationName: "requester" }),
  receivedIntroductions: many(introductions, { relationName: "target" }),
  likes: many(likes),
}));

export const promptsRelations = relations(prompts, ({ many }) => ({
  responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
  user: one(users, {
    fields: [responses.userId],
    references: [users.id],
  }),
  prompt: one(prompts, {
    fields: [responses.promptId],
    references: [prompts.id],
  }),
  comments: many(comments),
  likes: many(likes),
  introductions: many(introductions),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  response: one(responses, {
    fields: [comments.responseId],
    references: [responses.id],
  }),
  likes: many(likes),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  memberships: many(groupMemberships),
}));

export const groupMembershipsRelations = relations(groupMemberships, ({ one }) => ({
  user: one(users, {
    fields: [groupMemberships.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [groupMemberships.groupId],
    references: [groups.id],
  }),
}));

export const introductionsRelations = relations(introductions, ({ one }) => ({
  requester: one(users, {
    fields: [introductions.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  target: one(users, {
    fields: [introductions.targetId],
    references: [users.id],
    relationName: "target",
  }),
  contextResponse: one(responses, {
    fields: [introductions.contextResponseId],
    references: [responses.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  response: one(responses, {
    fields: [likes.responseId],
    references: [responses.id],
  }),
  comment: one(comments, {
    fields: [likes.commentId],
    references: [comments.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertPromptSchema = createInsertSchema(prompts);
export const insertResponseSchema = createInsertSchema(responses);
export const insertCommentSchema = createInsertSchema(comments);
export const insertGroupSchema = createInsertSchema(groups);
export const insertIntroductionSchema = createInsertSchema(introductions);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Onboarding step schemas
export const signupSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  email: true,
  countryCode: true,
  mobileNumber: true,
  termsAccepted: true,
  privacyAccepted: true,
  guidelinesAccepted: true,
}).extend({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the Terms of Service",
  }),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the Privacy Policy",
  }),
  guidelinesAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the Community Guidelines",
  }),
});

export const socialProfileSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  gender: true,
  dateOfBirth: true,
  city: true,
  maritalStatus: true,
  personalIntro: true,
  instagramUrl: true,
  facebookUrl: true,
  linkedinUrl: true,
}).extend({
  socialVerification: z.string().optional(),
  dateOfBirth: z.string().optional().transform((str) => str ? new Date(str) : undefined),
});

export const fullProfileSchema = createInsertSchema(users).pick({
  middleName: true,
  height: true,
  hasChildren: true,
  faith: true,
  country: true,
  state: true,
  nationality: true,
  smoking: true,
  drinking: true,
  diet: true,
  workout: true,
  interests: true,
  languages: true,
  education: true,
  degree: true,
  institution: true,
  professionalIntro: true,
  industry: true,
  currency: true,
  incomeRange: true,
  idDocumentType: true,
  idDocumentNumber: true,
  preferredAgeMin: true,
  preferredAgeMax: true,
  preferredHeightMin: true,
  preferredHeightMax: true,
  preferredSmoking: true,
  preferredDrinking: true,
  preferredFaith: true,
  preferredMaritalStatus: true,
  willingToRelocate: true,
  acceptSingleParent: true,
  additionalPreferences: true,
  bio: true,
  familyDetails: true,
  healthConcerns: true,
  photoUrls: true,
  profileVisibility: true,
  publicProfileFields: true,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SocialProfileInput = z.infer<typeof socialProfileSchema>;
export type FullProfileInput = z.infer<typeof fullProfileSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Response = typeof responses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type GroupMembership = typeof groupMemberships.$inferSelect;
export type Introduction = typeof introductions.$inferSelect;
export type InsertIntroduction = z.infer<typeof insertIntroductionSchema>;
export type Like = typeof likes.$inferSelect;
