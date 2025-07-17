import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  role: varchar("role").notNull().default("admin"), // admin or trainee
});

// Sponsors table
export const sponsors = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trainees table
export const trainees = pgTable("trainees", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  traineeId: varchar("trainee_id").unique().notNull(), // Auto-generated unique ID
  tagNumber: varchar("tag_number").unique().notNull(), // e.g., FAMS-0091
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  middleName: varchar("middle_name"),
  email: varchar("email").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  gender: varchar("gender").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  stateOfOrigin: varchar("state_of_origin").notNull(),
  localGovernmentArea: varchar("local_government_area").notNull(),
  nationality: varchar("nationality").notNull().default("Nigerian"),
  passportPhotoUrl: varchar("passport_photo_url"),
  
  // Auto-assigned fields
  sponsorId: integer("sponsor_id").references(() => sponsors.id),
  roomNumber: varchar("room_number").notNull(),
  lectureVenue: varchar("lecture_venue").notNull(),
  mealVenue: varchar("meal_venue").notNull(),
  
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  verificationCode: varchar("verification_code"),
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content table for videos, quizzes, assignments
export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // video, quiz, assignment
  contentUrl: varchar("content_url"),
  contentData: jsonb("content_data"), // Store quiz questions, assignment details, etc.
  sponsorId: integer("sponsor_id").references(() => sponsors.id),
  dueDate: timestamp("due_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trainee progress tracking
export const traineeProgress = pgTable("trainee_progress", {
  id: serial("id").primaryKey(),
  traineeId: integer("trainee_id").references(() => trainees.id),
  contentId: integer("content_id").references(() => content.id),
  status: varchar("status").notNull().default("not_started"), // not_started, in_progress, completed
  score: integer("score"),
  submissionUrl: varchar("submission_url"),
  submissionData: jsonb("submission_data"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  sponsorId: integer("sponsor_id").references(() => sponsors.id), // null for global announcements
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System settings table
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").unique().notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  trainee: one(trainees, { fields: [users.id], references: [trainees.userId] }),
}));

export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  trainees: many(trainees),
  content: many(content),
  announcements: many(announcements),
}));

export const traineesRelations = relations(trainees, ({ one, many }) => ({
  user: one(users, { fields: [trainees.userId], references: [users.id] }),
  sponsor: one(sponsors, { fields: [trainees.sponsorId], references: [sponsors.id] }),
  progress: many(traineeProgress),
}));

export const contentRelations = relations(content, ({ one, many }) => ({
  sponsor: one(sponsors, { fields: [content.sponsorId], references: [sponsors.id] }),
  progress: many(traineeProgress),
}));

export const traineeProgressRelations = relations(traineeProgress, ({ one }) => ({
  trainee: one(trainees, { fields: [traineeProgress.traineeId], references: [trainees.id] }),
  content: one(content, { fields: [traineeProgress.contentId], references: [content.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  sponsor: one(sponsors, { fields: [announcements.sponsorId], references: [sponsors.id] }),
}));

// Insert schemas
export const insertSponsorSchema = createInsertSchema(sponsors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTraineeSchema = createInsertSchema(trainees).omit({
  id: true,
  traineeId: true,
  tagNumber: true,
  roomNumber: true,
  lectureVenue: true,
  mealVenue: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type Trainee = typeof trainees.$inferSelect;
export type InsertTrainee = z.infer<typeof insertTraineeSchema>;
export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type TraineeProgress = typeof traineeProgress.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
