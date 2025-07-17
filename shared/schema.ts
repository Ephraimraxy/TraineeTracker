import { z } from "zod";

// Firestore-based schema types

// User type - mandatory for Replit Auth
export type User = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: "admin" | "trainee";
  createdAt: Date;
  updatedAt: Date;
};

// UpsertUser type for user creation/update
export type UpsertUser = Omit<User, 'createdAt' | 'updatedAt'>;

// Sponsor type
export type Sponsor = {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Trainee type
export type Trainee = {
  id: string;
  userId?: string;
  traineeId: string; // Auto-generated unique ID
  tagNumber: string; // e.g., FAMS-0091
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;
  stateOfOrigin: string;
  localGovernmentArea: string;
  nationality: string;
  passportPhotoUrl?: string;
  
  // Auto-assigned fields
  sponsorId?: string;
  roomNumber: string;
  lectureVenue: string;
  mealVenue: string;
  
  isActive: boolean;
  emailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  
  createdAt: Date;
  updatedAt: Date;
};

// Content type for videos, quizzes, assignments
export type Content = {
  id: string;
  title: string;
  description?: string;
  type: "video" | "quiz" | "assignment";
  contentUrl?: string;
  contentData?: any; // Store quiz questions, assignment details, etc.
  sponsorId?: string;
  dueDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Trainee progress tracking
export type TraineeProgress = {
  id: string;
  traineeId: string;
  contentId: string;
  status: "not_started" | "in_progress" | "completed";
  score?: number;
  submissionUrl?: string;
  submissionData?: any;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Announcements type
export type Announcement = {
  id: string;
  title: string;
  message: string;
  sponsorId?: string; // null for global announcements
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// System settings type
export type SystemSetting = {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
};

// Zod schemas for validation
export const insertSponsorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().default(true),
});

export const insertTraineeSchema = z.object({
  userId: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number is required"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.date(),
  stateOfOrigin: z.string().min(1, "State of origin is required"),
  localGovernmentArea: z.string().min(1, "Local government area is required"),
  nationality: z.string().default("Nigerian"),
  passportPhotoUrl: z.string().optional(),
  sponsorId: z.string().optional(),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
  verificationCode: z.string().optional(),
  verificationCodeExpiry: z.date().optional(),
});

export const insertContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["video", "quiz", "assignment"]),
  contentUrl: z.string().optional(),
  contentData: z.any().optional(),
  sponsorId: z.string().optional(),
  dueDate: z.date().optional(),
  isActive: z.boolean().default(true),
});

export const insertAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  sponsorId: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Types
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type InsertTrainee = z.infer<typeof insertTraineeSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
