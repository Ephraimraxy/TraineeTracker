import {
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
import { db } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  deleteDoc,
  Timestamp
} from "firebase/firestore";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Sponsor operations
  getSponsors(): Promise<Sponsor[]>;
  getSponsor(id: string): Promise<Sponsor | undefined>;
  createSponsor(sponsor: InsertSponsor): Promise<Sponsor>;
  updateSponsor(id: string, sponsor: Partial<InsertSponsor>): Promise<Sponsor>;
  getActiveSponsor(): Promise<Sponsor | undefined>;
  
  // Trainee operations
  getTrainees(): Promise<Trainee[]>;
  getTraineesBySponsor(sponsorId: string): Promise<Trainee[]>;
  getTrainee(id: string): Promise<Trainee | undefined>;
  getTraineeByEmail(email: string): Promise<Trainee | undefined>;
  getTraineeByUserId(userId: string): Promise<Trainee | undefined>;
  createTrainee(trainee: InsertTrainee): Promise<Trainee>;
  updateTrainee(id: string, trainee: Partial<InsertTrainee>): Promise<Trainee>;
  verifyTraineeEmail(email: string, code: string): Promise<boolean>;
  
  // Content operations
  getContent(): Promise<Content[]>;
  getContentBySponsor(sponsorId: string): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: string, content: Partial<InsertContent>): Promise<Content>;
  
  // Progress operations
  getTraineeProgress(traineeId: string): Promise<TraineeProgress[]>;
  updateProgress(traineeId: string, contentId: string, progress: Partial<TraineeProgress>): Promise<TraineeProgress>;
  
  // Announcement operations
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncementsBySponsor(sponsorId: string): Promise<Announcement[]>;
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
  // Helper function to convert Firestore timestamps to Date objects
  private convertTimestamps(data: any): any {
    if (!data) return data;
    
    const converted = { ...data };
    for (const key in converted) {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate();
      }
    }
    return converted;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const userDoc = await getDoc(doc(db, 'users', id));
    if (userDoc.exists()) {
      return this.convertTimestamps({ id: userDoc.id, ...userDoc.data() }) as User;
    }
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userRef = doc(db, 'users', userData.id);
    const userDoc = await getDoc(userRef);
    
    const now = new Date();
    const userToSave = {
      ...userData,
      updatedAt: now,
      createdAt: userDoc.exists() ? userDoc.data()?.createdAt : now,
    };

    if (userDoc.exists()) {
      await updateDoc(userRef, userToSave);
    } else {
      await setDoc(userRef, userToSave);
    }
    return userToSave as User;
  }

  // Sponsor operations
  async getSponsors(): Promise<Sponsor[]> {
    const sponsorsQuery = query(
      collection(db, 'sponsors'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(sponsorsQuery);
    return snapshot.docs.map(doc => 
      this.convertTimestamps({ id: doc.id, ...doc.data() }) as Sponsor
    );
  }

  async getSponsor(id: string): Promise<Sponsor | undefined> {
    const sponsorDoc = await getDoc(doc(db, 'sponsors', id));
    if (sponsorDoc.exists()) {
      return this.convertTimestamps({ id: sponsorDoc.id, ...sponsorDoc.data() }) as Sponsor;
    }
    return undefined;
  }

  async createSponsor(sponsor: InsertSponsor): Promise<Sponsor> {
    const now = new Date();
    const sponsorData = {
      ...sponsor,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, 'sponsors'), sponsorData);
    return { id: docRef.id, ...sponsorData } as Sponsor;
  }

  async updateSponsor(id: string, sponsor: Partial<InsertSponsor>): Promise<Sponsor> {
    const sponsorRef = doc(db, 'sponsors', id);
    const updateData = {
      ...sponsor,
      updatedAt: new Date(),
    };
    
    await updateDoc(sponsorRef, updateData);
    const updatedDoc = await getDoc(sponsorRef);
    return this.convertTimestamps({ id: updatedDoc.id, ...updatedDoc.data() }) as Sponsor;
  }

  async getActiveSponsor(): Promise<Sponsor | undefined> {
    const sponsorsQuery = query(
      collection(db, 'sponsors'),
      where('isActive', '==', true),
      limit(1)
    );
    const snapshot = await getDocs(sponsorsQuery);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return this.convertTimestamps({ id: doc.id, ...doc.data() }) as Sponsor;
    }
    return undefined;
  }

  // Trainee operations
  async getTrainees(): Promise<Trainee[]> {
    const traineesQuery = query(
      collection(db, 'trainees'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(traineesQuery);
    return snapshot.docs.map(doc => 
      this.convertTimestamps({ id: doc.id, ...doc.data() }) as Trainee
    );
  }

  async getTraineesBySponsor(sponsorId: string): Promise<Trainee[]> {
    const traineesQuery = query(
      collection(db, 'trainees'),
      where('sponsorId', '==', sponsorId)
    );
    const snapshot = await getDocs(traineesQuery);
    return snapshot.docs.map(doc => 
      this.convertTimestamps({ id: doc.id, ...doc.data() }) as Trainee
    );
  }

  async getTrainee(id: string): Promise<Trainee | undefined> {
    const traineeDoc = await getDoc(doc(db, 'trainees', id));
    if (traineeDoc.exists()) {
      return this.convertTimestamps({ id: traineeDoc.id, ...traineeDoc.data() }) as Trainee;
    }
    return undefined;
  }

  async getTraineeByEmail(email: string): Promise<Trainee | undefined> {
    const traineesQuery = query(
      collection(db, 'trainees'),
      where('email', '==', email),
      limit(1)
    );
    const snapshot = await getDocs(traineesQuery);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return this.convertTimestamps({ id: doc.id, ...doc.data() }) as Trainee;
    }
    return undefined;
  }

  async getTraineeByUserId(userId: string): Promise<Trainee | undefined> {
    const traineesQuery = query(
      collection(db, 'trainees'),
      where('userId', '==', userId),
      limit(1)
    );
    const snapshot = await getDocs(traineesQuery);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return this.convertTimestamps({ id: doc.id, ...doc.data() }) as Trainee;
    }
    return undefined;
  }

  async createTrainee(trainee: InsertTrainee): Promise<Trainee> {
    // Generate unique trainee ID and tag number
    const traineesSnapshot = await getDocs(collection(db, 'trainees'));
    const nextNumber = traineesSnapshot.size + 1;
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    
    // Auto-assign venues and room
    const venues = {
      lecture: ['Gold Hall', 'Silver Hall', 'White Hall'],
      meal: ['Restaurant 1', 'Restaurant 2', 'Restaurant 3'],
    };
    
    const lectureVenue = venues.lecture[Math.floor(Math.random() * venues.lecture.length)];
    const mealVenue = venues.meal[Math.floor(Math.random() * venues.meal.length)];
    const roomNumber = (100 + Math.floor(Math.random() * 300)).toString();
    
    const now = new Date();
    const traineeData = {
      ...trainee,
      traineeId: `TRAINEE-${paddedNumber}`,
      tagNumber: `FAMS-${paddedNumber}`,
      roomNumber,
      lectureVenue,
      mealVenue,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'trainees'), traineeData);
    return { id: docRef.id, ...traineeData } as Trainee;
  }

  async updateTrainee(id: string, trainee: Partial<InsertTrainee>): Promise<Trainee> {
    const traineeRef = doc(db, 'trainees', id);
    const updateData = {
      ...trainee,
      updatedAt: new Date(),
    };
    
    await updateDoc(traineeRef, updateData);
    const updatedDoc = await getDoc(traineeRef);
    return this.convertTimestamps({ id: updatedDoc.id, ...updatedDoc.data() }) as Trainee;
  }

  async verifyTraineeEmail(email: string, code: string): Promise<boolean> {
    const traineesQuery = query(
      collection(db, 'trainees'),
      where('email', '==', email),
      where('verificationCode', '==', code),
      limit(1)
    );
    const snapshot = await getDocs(traineesQuery);
    
    if (!snapshot.empty) {
      const traineeDoc = snapshot.docs[0];
      const traineeData = traineeDoc.data();
      
      if (traineeData.verificationCodeExpiry && traineeData.verificationCodeExpiry.toDate() > new Date()) {
        await updateDoc(traineeDoc.ref, {
          emailVerified: true,
          verificationCode: null,
          verificationCodeExpiry: null,
          updatedAt: new Date(),
        });
        return true;
      }
    }
    return false;
  }

  // Content operations
  async getContent(): Promise<Content[]> {
    const contentQuery = query(
      collection(db, 'content'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(contentQuery);
    return snapshot.docs.map(doc => 
      this.convertTimestamps({ id: doc.id, ...doc.data() }) as Content
    );
  }

  async getContentBySponsor(sponsorId: string): Promise<Content[]> {
    const contentQuery = query(
      collection(db, 'content'),
      where('sponsorId', '==', sponsorId)
    );
    const snapshot = await getDocs(contentQuery);
    return snapshot.docs.map(doc => 
      this.convertTimestamps({ id: doc.id, ...doc.data() }) as Content
    );
  }

  async createContent(contentData: InsertContent): Promise<Content> {
    const now = new Date();
    const content = {
      ...contentData,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, 'content'), content);
    return { id: docRef.id, ...content } as Content;
  }

  async updateContent(id: string, contentData: Partial<InsertContent>): Promise<Content> {
    const contentRef = doc(db, 'content', id);
    const updateData = {
      ...contentData,
      updatedAt: new Date(),
    };
    
    await updateDoc(contentRef, updateData);
    const updatedDoc = await getDoc(contentRef);
    return this.convertTimestamps({ id: updatedDoc.id, ...updatedDoc.data() }) as Content;
  }

  // Progress operations
  async getTraineeProgress(traineeId: string): Promise<TraineeProgress[]> {
    const progressQuery = query(
      collection(db, 'traineeProgress'),
      where('traineeId', '==', traineeId)
    );
    const snapshot = await getDocs(progressQuery);
    return snapshot.docs.map(doc => 
      this.convertTimestamps({ id: doc.id, ...doc.data() }) as TraineeProgress
    );
  }

  async updateProgress(
    traineeId: string,
    contentId: string,
    progress: Partial<TraineeProgress>
  ): Promise<TraineeProgress> {
    const progressQuery = query(
      collection(db, 'traineeProgress'),
      where('traineeId', '==', traineeId),
      where('contentId', '==', contentId),
      limit(1)
    );
    const snapshot = await getDocs(progressQuery);
    
    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      const updateData = {
        ...progress,
        updatedAt: new Date(),
      };
      
      await updateDoc(existingDoc.ref, updateData);
      const updatedDoc = await getDoc(existingDoc.ref);
      return this.convertTimestamps({ id: updatedDoc.id, ...updatedDoc.data() }) as TraineeProgress;
    } else {
      const now = new Date();
      const progressData = {
        traineeId,
        contentId,
        ...progress,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'traineeProgress'), progressData);
      return { id: docRef.id, ...progressData } as TraineeProgress;
    }
  }

  // Announcement operations
  async getAnnouncements(): Promise<Announcement[]> {
    const announcementsQuery = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(announcementsQuery);
    return snapshot.docs.map(doc => 
      this.convertTimestamps({ id: doc.id, ...doc.data() }) as Announcement
    );
  }

  async getAnnouncementsBySponsor(sponsorId: string): Promise<Announcement[]> {
    const announcementsQuery = query(
      collection(db, 'announcements'),
      where('sponsorId', '==', sponsorId)
    );
    const snapshot = await getDocs(announcementsQuery);
    return snapshot.docs.map(doc => 
      this.convertTimestamps({ id: doc.id, ...doc.data() }) as Announcement
    );
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const now = new Date();
    const announcementData = {
      ...announcement,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, 'announcements'), announcementData);
    return { id: docRef.id, ...announcementData } as Announcement;
  }

  // System settings
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const settingDoc = await getDoc(doc(db, 'systemSettings', key));
    if (settingDoc.exists()) {
      return this.convertTimestamps({ id: settingDoc.id, ...settingDoc.data() }) as SystemSetting;
    }
    return undefined;
  }

  async updateSystemSetting(key: string, value: string): Promise<SystemSetting> {
    const settingRef = doc(db, 'systemSettings', key);
    const settingData = {
      key,
      value,
      updatedAt: new Date(),
    };
    
    await setDoc(settingRef, settingData);
    return { id: key, ...settingData } as SystemSetting;
  }

  // Statistics
  async getStatistics(): Promise<{
    totalTrainees: number;
    activeSponsors: number;
    completedCourses: number;
    activeContent: number;
  }> {
    const [traineesSnapshot, sponsorsSnapshot, progressSnapshot, contentSnapshot] = await Promise.all([
      getDocs(collection(db, 'trainees')),
      getDocs(query(collection(db, 'sponsors'), where('isActive', '==', true))),
      getDocs(query(collection(db, 'traineeProgress'), where('status', '==', 'completed'))),
      getDocs(query(collection(db, 'content'), where('isActive', '==', true))),
    ]);

    return {
      totalTrainees: traineesSnapshot.size,
      activeSponsors: sponsorsSnapshot.size,
      completedCourses: progressSnapshot.size,
      activeContent: contentSnapshot.size,
    };
  }
}

export const storage = new DatabaseStorage();
