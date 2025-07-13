import express from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import type { Express, RequestHandler } from "express";
import bcrypt from "bcrypt";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "default-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check for default admin credentials
      if (username === "admin" && password === "admin") {
        let user = await storage.getUser("admin");
        if (!user) {
          user = await storage.upsertUser({
            id: "admin",
            email: "admin@fortress.com",
            firstName: "Admin",
            lastName: "User",
            profileImageUrl: null,
          });
        }

        (req.session as any).user = user;
        return res.json({ user });
      }

      // For demo purposes, allow any username with password "password"
      if (password === "password") {
        let user = await storage.getUser(username);
        if (!user) {
          user = await storage.upsertUser({
            id: username,
            email: `${username}@fortress.com`,
            firstName: username.charAt(0).toUpperCase() + username.slice(1),
            lastName: "User",
            profileImageUrl: null,
          });
        }

        (req.session as any).user = user;
        return res.json({ user });
      }

      res.status(401).json({ message: "Invalid credentials" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req, res) => {
    const user = (req.session as any)?.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(user);
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = (req.session as any)?.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};