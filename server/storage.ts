import {
  users,
  sponsors,
  trainees,
  content,
  traineeProgress,
  announcements,
  systemSettings,
  type User,
  type UpsertUser,
  type Sponsor,
  type InsertSponsor,
  type Trainee,
  type InsertTrainee,
  type Content,
  type InsertContent,
  type TraineeProgress,
  type Announcement,
  type InsertAnnouncement,
  type SystemSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Sponsor operations
  getSponsors(): Promise<Sponsor[]>;
  getSponsor(id: number): Promise<Sponsor | undefined>;
  createSponsor(sponsor: InsertSponsor): Promise<Sponsor>;
  updateSponsor(id: number, sponsor: Partial<InsertSponsor>): Promise<Sponsor>;
  getActiveSponsor(): Promise<Sponsor | undefined>;
  
  // Trainee operations
  getTrainees(): Promise<Trainee[]>;
  getTraineesBySponsor(sponsorId: number): Promise<Trainee[]>;
  getTrainee(id: number): Promise<Trainee | undefined>;
  getTraineeByEmail(email: string): Promise<Trainee | undefined>;
  getTraineeByUserId(userId: string): Promise<Trainee | undefined>;
  createTrainee(trainee: InsertTrainee): Promise<Trainee>;
  updateTrainee(id: number, trainee: Partial<InsertTrainee>): Promise<Trainee>;
  verifyTraineeEmail(email: string, code: string): Promise<boolean>;
  
  // Content operations
  getContent(): Promise<Content[]>;
  getContentBySponsor(sponsorId: number): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<InsertContent>): Promise<Content>;
  
  // Progress operations
  getTraineeProgress(traineeId: number): Promise<TraineeProgress[]>;
  updateProgress(traineeId: number, contentId: number, progress: Partial<TraineeProgress>): Promise<TraineeProgress>;
  
  // Announcement operations
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncementsBySponsor(sponsorId: number): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  
  // System settings
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  updateSystemSetting(key: string, value: string): Promise<SystemSetting>;
  
  // Statistics
  getStatistics(): Promise<{
    totalTrainees: number;
    activeSponsors: number;
    completedCourses: number;
    activeContent: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  // Sponsor operations
  async getSponsors(): Promise<Sponsor[]> {
    return await db.select().from(sponsors).orderBy(desc(sponsors.createdAt));
  }

  async getSponsor(id: number): Promise<Sponsor | undefined> {
    const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.id, id));
    return sponsor;
  }

  async createSponsor(sponsor: InsertSponsor): Promise<Sponsor> {
    const [newSponsor] = await db.insert(sponsors).values(sponsor).returning();
    return newSponsor;
  }

  async updateSponsor(id: number, sponsor: Partial<InsertSponsor>): Promise<Sponsor> {
    const [updatedSponsor] = await db
      .update(sponsors)
      .set({ ...sponsor, updatedAt: new Date() })
      .where(eq(sponsors.id, id))
      .returning();
    return updatedSponsor;
  }

  async getActiveSponsor(): Promise<Sponsor | undefined> {
    const [sponsor] = await db
      .select()
      .from(sponsors)
      .where(eq(sponsors.isActive, true))
      .orderBy(desc(sponsors.createdAt))
      .limit(1);
    return sponsor;
  }

  // Trainee operations
  async getTrainees(): Promise<Trainee[]> {
    return await db.select().from(trainees).orderBy(desc(trainees.createdAt));
  }

  async getTraineesBySponsor(sponsorId: number): Promise<Trainee[]> {
    return await db
      .select()
      .from(trainees)
      .where(eq(trainees.sponsorId, sponsorId))
      .orderBy(desc(trainees.createdAt));
  }

  async getTrainee(id: number): Promise<Trainee | undefined> {
    const [trainee] = await db.select().from(trainees).where(eq(trainees.id, id));
    return trainee;
  }

  async getTraineeByEmail(email: string): Promise<Trainee | undefined> {
    const [trainee] = await db.select().from(trainees).where(eq(trainees.email, email));
    return trainee;
  }

  async getTraineeByUserId(userId: string): Promise<Trainee | undefined> {
    const [trainee] = await db.select().from(trainees).where(eq(trainees.userId, userId));
    return trainee;
  }

  async createTrainee(trainee: InsertTrainee): Promise<Trainee> {
    // Generate unique trainee ID and tag number
    const traineeCount = await db.select({ count: count() }).from(trainees);
    const nextNumber = (traineeCount[0]?.count || 0) + 1;
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    
    // Auto-assign venues and room
    const venues = {
      lecture: ['Gold Hall', 'Silver Hall', 'White Hall'],
      meal: ['Restaurant 1', 'Restaurant 2', 'Restaurant 3'],
    };
    
    const lectureVenue = venues.lecture[Math.floor(Math.random() * venues.lecture.length)];
    const mealVenue = venues.meal[Math.floor(Math.random() * venues.meal.length)];
    const roomNumber = (100 + Math.floor(Math.random() * 300)).toString();
    
    const traineeData = {
      ...trainee,
      traineeId: `TRAINEE-${paddedNumber}`,
      tagNumber: `FAMS-${paddedNumber}`,
      roomNumber,
      lectureVenue,
      mealVenue,
    };

    const [newTrainee] = await db.insert(trainees).values(traineeData).returning();
    return newTrainee;
  }

  async updateTrainee(id: number, trainee: Partial<InsertTrainee>): Promise<Trainee> {
    const [updatedTrainee] = await db
      .update(trainees)
      .set({ ...trainee, updatedAt: new Date() })
      .where(eq(trainees.id, id))
      .returning();
    return updatedTrainee;
  }

  async verifyTraineeEmail(email: string, code: string): Promise<boolean> {
    const [trainee] = await db
      .select()
      .from(trainees)
      .where(
        and(
          eq(trainees.email, email),
          eq(trainees.verificationCode, code)
        )
      );

    if (trainee && trainee.verificationCodeExpiry && trainee.verificationCodeExpiry > new Date()) {
      await db
        .update(trainees)
        .set({
          emailVerified: true,
          verificationCode: null,
          verificationCodeExpiry: null,
          updatedAt: new Date(),
        })
        .where(eq(trainees.id, trainee.id));
      return true;
    }
    return false;
  }

  // Content operations
  async getContent(): Promise<Content[]> {
    return await db.select().from(content).orderBy(desc(content.createdAt));
  }

  async getContentBySponsor(sponsorId: number): Promise<Content[]> {
    return await db
      .select()
      .from(content)
      .where(eq(content.sponsorId, sponsorId))
      .orderBy(desc(content.createdAt));
  }

  async createContent(contentData: InsertContent): Promise<Content> {
    const [newContent] = await db.insert(content).values(contentData).returning();
    return newContent;
  }

  async updateContent(id: number, contentData: Partial<InsertContent>): Promise<Content> {
    const [updatedContent] = await db
      .update(content)
      .set({ ...contentData, updatedAt: new Date() })
      .where(eq(content.id, id))
      .returning();
    return updatedContent;
  }

  // Progress operations
  async getTraineeProgress(traineeId: number): Promise<TraineeProgress[]> {
    return await db
      .select()
      .from(traineeProgress)
      .where(eq(traineeProgress.traineeId, traineeId))
      .orderBy(desc(traineeProgress.createdAt));
  }

  async updateProgress(
    traineeId: number,
    contentId: number,
    progress: Partial<TraineeProgress>
  ): Promise<TraineeProgress> {
    const [existing] = await db
      .select()
      .from(traineeProgress)
      .where(
        and(
          eq(traineeProgress.traineeId, traineeId),
          eq(traineeProgress.contentId, contentId)
        )
      );

    if (existing) {
      const [updated] = await db
        .update(traineeProgress)
        .set({ ...progress, updatedAt: new Date() })
        .where(eq(traineeProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(traineeProgress)
        .values({
          traineeId,
          contentId,
          ...progress,
        })
        .returning();
      return newProgress;
    }
  }

  // Announcement operations
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncementsBySponsor(sponsorId: number): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.sponsorId, sponsorId))
      .orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  // System settings
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting> {
    const [setting] = await db
      .insert(systemSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return setting;
  }

  // Statistics
  async getStatistics(): Promise<{
    totalTrainees: number;
    activeSponsors: number;
    completedCourses: number;
    activeContent: number;
  }> {
    const [totalTrainees] = await db.select({ count: count() }).from(trainees);
    const [activeSponsors] = await db
      .select({ count: count() })
      .from(sponsors)
      .where(eq(sponsors.isActive, true));
    const [completedCourses] = await db
      .select({ count: count() })
      .from(traineeProgress)
      .where(eq(traineeProgress.status, 'completed'));
    const [activeContent] = await db
      .select({ count: count() })
      .from(content)
      .where(eq(content.isActive, true));

    return {
      totalTrainees: totalTrainees?.count || 0,
      activeSponsors: activeSponsors?.count || 0,
      completedCourses: completedCourses?.count || 0,
      activeContent: activeContent?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
