import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("Invalid file type"));
      return;
    }
    cb(null, true);
  },
});

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/posts", upload.single("image"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const post = await storage.createPost(
      req.user!.id,
      req.body.content,
      imageUrl
    );

    res.status(201).json(post);
  });

  app.get("/api/posts", async (_req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const postId = parseInt(req.params.postId);
    const post = await storage.getPost(postId);
    if (!post) return res.sendStatus(404);

    const comment = await storage.createComment(
      postId,
      req.user!.id,
      req.body.content
    );

    res.status(201).json(comment);
  });

  app.get("/api/posts/:postId/comments", async (req, res) => {
    const postId = parseInt(req.params.postId);
    const comments = await storage.getCommentsByPost(postId);
    res.json(comments);
  });

  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}