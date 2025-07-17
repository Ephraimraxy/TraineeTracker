import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { authenticateAdmin, isAdminAuthenticated, destroyAdminSession } from "./adminAuth";
import { insertSponsorSchema, insertTraineeSchema, insertContentSchema, insertAnnouncementSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Admin authentication routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const sessionToken = await authenticateAdmin(email, password);
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set secure cookie
      res.cookie('adminToken', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
      });
      
      res.json({ 
        message: "Login successful", 
        user: { 
          id: "admin-default",
          email: email,
          firstName: "Admin",
          lastName: "User",
          role: "admin"
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    const token = req.cookies?.adminToken;
    if (token) {
      destroyAdminSession(token);
      res.clearCookie('adminToken');
    }
    res.json({ message: "Logout successful" });
  });

  // Combined auth route that handles both Replit Auth and Admin Auth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for admin token first
      const adminToken = req.cookies?.adminToken;
      if (adminToken) {
        const adminSession = require('./adminAuth').verifyAdminSession(adminToken);
        if (adminSession) {
          const user = await storage.getUser("admin-default");
          if (user) {
            return res.json(user);
          }
        }
      }
      
      // Fall back to Replit Auth
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If user is trainee, get trainee data
      if (user.role === 'trainee') {
        const trainee = await storage.getTraineeByUserId(userId);
        if (trainee) {
          const sponsor = trainee.sponsorId ? await storage.getSponsor(trainee.sponsorId) : null;
          return res.json({ ...user, trainee, sponsor });
        }
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // System settings routes
  app.get('/api/settings/:key', async (req, res) => {
    try {
      const setting = await storage.getSystemSetting(req.params.key);
      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const { key, value } = req.body;
      const setting = await storage.updateSystemSetting(key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Sponsor routes
  app.get('/api/sponsors', isAuthenticated, async (req, res) => {
    try {
      const sponsors = await storage.getSponsors();
      res.json(sponsors);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
      res.status(500).json({ message: "Failed to fetch sponsors" });
    }
  });

  app.get('/api/sponsors/active', async (req, res) => {
    try {
      const activeSponsor = await storage.getActiveSponsor();
      res.json(activeSponsor);
    } catch (error) {
      console.error("Error fetching active sponsor:", error);
      res.status(500).json({ message: "Failed to fetch active sponsor" });
    }
  });

  app.post('/api/sponsors', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertSponsorSchema.parse(req.body);
      const sponsor = await storage.createSponsor(validatedData);
      res.json(sponsor);
    } catch (error) {
      console.error("Error creating sponsor:", error);
      res.status(500).json({ message: "Failed to create sponsor" });
    }
  });

  app.patch('/api/sponsors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = req.params.id;
      const validatedData = insertSponsorSchema.partial().parse(req.body);
      const sponsor = await storage.updateSponsor(id, validatedData);
      res.json(sponsor);
    } catch (error) {
      console.error("Error updating sponsor:", error);
      res.status(500).json({ message: "Failed to update sponsor" });
    }
  });

  // Trainee routes
  app.get('/api/trainees', isAuthenticated, async (req, res) => {
    try {
      const { sponsorId } = req.query;
      let trainees;
      
      if (sponsorId) {
        trainees = await storage.getTraineesBySponsor(sponsorId as string);
      } else {
        trainees = await storage.getTrainees();
      }
      
      res.json(trainees);
    } catch (error) {
      console.error("Error fetching trainees:", error);
      res.status(500).json({ message: "Failed to fetch trainees" });
    }
  });

  // Registration routes
  app.post('/api/register/step1', async (req, res) => {
    try {
      const { email, password, confirmPassword } = req.body;
      
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Check if email already exists
      const existingTrainee = await storage.getTraineeByEmail(email);
      if (existingTrainee) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Generate verification code
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // TODO: Send verification email
      console.log(`Verification code for ${email}: ${verificationCode}`);

      res.json({ 
        message: "Verification code sent to email",
        email,
        // In production, don't send the code in response
        verificationCode: verificationCode // Only for development
      });
    } catch (error) {
      console.error("Error in registration step 1:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/register/verify', async (req, res) => {
    try {
      const { email, code } = req.body;
      
      // For now, we'll just validate the code exists
      // In production, this would check against stored verification codes
      if (code && code.length === 6) {
        res.json({ message: "Email verified successfully" });
      } else {
        res.status(400).json({ message: "Invalid verification code" });
      }
    } catch (error) {
      console.error("Error in email verification:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post('/api/register/complete', async (req, res) => {
    try {
      const traineeData = insertTraineeSchema.parse(req.body);
      
      // Get active sponsor
      const activeSponsor = await storage.getActiveSponsor();
      if (!activeSponsor) {
        return res.status(400).json({ message: "No active sponsor for registration" });
      }

      // Create trainee with sponsor assignment
      const trainee = await storage.createTrainee({
        ...traineeData,
        sponsorId: activeSponsor.id,
        emailVerified: true,
      });

      res.json({
        message: "Registration completed successfully",
        trainee: {
          id: trainee.id,
          traineeId: trainee.traineeId,
          tagNumber: trainee.tagNumber,
          email: trainee.email,
        }
      });
    } catch (error) {
      console.error("Error completing registration:", error);
      res.status(500).json({ message: "Registration completion failed" });
    }
  });

  // Content routes
  app.get('/api/content', isAuthenticated, async (req, res) => {
    try {
      const { sponsorId } = req.query;
      let content;
      
      if (sponsorId) {
        content = await storage.getContentBySponsor(sponsorId as string);
      } else {
        content = await storage.getContent();
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.post('/api/content', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertContentSchema.parse(req.body);
      const content = await storage.createContent(validatedData);
      res.json(content);
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(500).json({ message: "Failed to create content" });
    }
  });

  // Progress routes
  app.get('/api/progress/:traineeId', isAuthenticated, async (req, res) => {
    try {
      const traineeId = req.params.traineeId;
      const progress = await storage.getTraineeProgress(traineeId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const { traineeId, contentId, ...progressData } = req.body;
      const progress = await storage.updateProgress(traineeId, contentId, progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Announcement routes
  app.get('/api/announcements', isAuthenticated, async (req, res) => {
    try {
      const { sponsorId } = req.query;
      let announcements;
      
      if (sponsorId) {
        announcements = await storage.getAnnouncementsBySponsor(sponsorId as string);
      } else {
        announcements = await storage.getAnnouncements();
      }
      
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validatedData);
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // Statistics routes
  app.get('/api/statistics', isAuthenticated, async (req, res) => {
    try {
      const statistics = await storage.getStatistics();
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
