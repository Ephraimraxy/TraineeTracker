import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// import { setupAuth, isAdminAuthenticated } from "./replitAuth";
import { authenticateAdmin, isAdminAuthenticated, destroyAdminSession, verifyAdminSession } from "./adminAuth";
import { insertSponsorSchema, insertTraineeSchema, insertContentSchema, insertAnnouncementSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import { sendVerificationEmail } from "./emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware disabled for now since we're using Firebase and admin auth
  // await setupAuth(app);

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

      // Set HTTP-only cookie
      res.cookie('adminToken', sessionToken, {
        httpOnly: true,
        secure: false, // Set to false for development
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      const adminSession = verifyAdminSession(sessionToken);
      res.json({
        message: "Login successful",
        user: {
          id: adminSession.userId,
          email: adminSession.email,
          role: adminSession.role
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin me route to check current session
  app.get('/api/admin/me', (req: any, res) => {
    const token = req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // verifyAdminSession has already been imported at the top of the file using ESM import style
// so we can call it directly to ensure the same module instance is used

    const session = verifyAdminSession(token);
    if (!session) {
      return res.status(401).json({ message: "Session expired" });
    }

    res.json({
      id: session.userId,
      email: session.email,
      role: session.role
    });
  });

  app.get('/api/admin/logout', (req, res) => {
    const token = req.cookies?.adminToken;
    if (token) {
      destroyAdminSession(token);
      res.clearCookie('adminToken');
    }
    res.redirect('/');
  });

  // User profile creation route for Firebase Auth
  app.post('/api/users/profile', async (req, res) => {
    try {
      const { uid, email, firstName, lastName } = req.body;

      await setDoc(doc(db, 'users', uid), {
        id: uid,
        email,
        firstName,
        lastName,
        role: 'trainee',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.json({ message: 'User profile created successfully' });
    } catch (error) {
      console.error('Error creating user profile:', error);
      res.status(500).json({ message: 'Failed to create user profile' });
    }
  });

  // Combined auth route that handles Admin Auth only for now
  app.post('/api/auth', async (req, res) => {
    try {
      // Check for admin token first
      const adminToken = req.cookies?.adminToken;
      if (adminToken) {
        const adminSession = verifyAdminSession(adminToken);
        if (adminSession) {
          const user = await storage.getUser("admin-default");
          if (user) {
            return res.json(user);
          }
        }
      }

      // For now, return 401 for all non-admin requests
      return res.status(401).json({ message: "Unauthorized" });
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

  app.post('/api/settings', isAdminAuthenticated, async (req: any, res) => {
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
  app.get('/api/sponsors', isAdminAuthenticated, async (req, res) => {
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

  app.post('/api/sponsors', isAdminAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertSponsorSchema.parse(req.body);
      const sponsor = await storage.createSponsor(validatedData);
      res.json(sponsor);
    } catch (error) {
      console.error("Error creating sponsor:", error);
      res.status(500).json({ message: "Failed to create sponsor" });
    }
  });

  app.patch('/api/sponsors/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const id = req.params.id;
      const validatedData = insertSponsorSchema.partial().parse(req.body);

      // If setting this sponsor as active, deactivate all others first
      if (validatedData.isActive) {
        await storage.deactivateAllSponsors();
      }

      const sponsor = await storage.updateSponsor(id, validatedData);
      res.json(sponsor);
    } catch (error) {
      console.error("Error updating sponsor:", error);
      res.status(500).json({ message: "Failed to update sponsor" });
    }
  });

  app.delete('/api/sponsors/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const id = req.params.id;
      await storage.deleteSponsor(id);
      res.json({ message: "Sponsor deleted successfully" });
    } catch (error) {
      console.error("Error deleting sponsor:", error);
      res.status(500).json({ message: "Failed to delete sponsor" });
    }
  });

  // Trainee routes
  app.get('/api/trainees', isAdminAuthenticated, async (req, res) => {
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

      // Store verification code temporarily (you might want to use Redis or database for production)
      // For now, we'll store it in memory with expiry
      global.verificationCodes = global.verificationCodes || {};
      global.verificationCodes[email] = {
        code: verificationCode,
        expiry: verificationCodeExpiry
      };

      // Send verification email
      const emailSent = await sendVerificationEmail(email, verificationCode);

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email. Please try again." });
      }

      console.log(`Verification code for ${email}: ${verificationCode}`); // Keep for debugging

      res.json({ 
        message: "Verification code sent to your email address",
        email
      });
    } catch (error) {
      console.error("Error in registration step 1:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/register/verify', async (req, res) => {
    try {
      const { email, code } = req.body;

      // Check stored verification codes
      global.verificationCodes = global.verificationCodes || {};
      const storedData = global.verificationCodes[email];

      if (!storedData) {
        return res.status(400).json({ message: "No verification code found for this email" });
      }

      if (new Date() > storedData.expiry) {
        // Clean up expired code
        delete global.verificationCodes[email];
        return res.status(400).json({ message: "Verification code has expired" });
      }

      if (storedData.code !== code) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Clean up used code
      delete global.verificationCodes[email];

      res.json({ message: "Email verified successfully" });
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
  app.get('/api/content', async (req, res) => {
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

  app.post('/api/content', isAdminAuthenticated, async (req: any, res) => {
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
  app.get('/api/progress/:traineeId', isAdminAuthenticated, async (req, res) => {
    try {
      const traineeId = req.params.traineeId;
      const progress = await storage.getTraineeProgress(traineeId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post('/api/progress', isAdminAuthenticated, async (req: any, res) => {
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
  app.get('/api/announcements', async (req, res) => {
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

  app.post('/api/announcements', isAdminAuthenticated, async (req: any, res) => {
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
  app.get('/api/statistics', isAdminAuthenticated, async (req, res) => {
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
import { setDoc, doc, getFirestore } from "firebase/firestore";

const db = getFirestore();