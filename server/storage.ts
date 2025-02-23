
import { User, InsertUser, Post, Comment, PostWithUser, CommentWithUser } from "@shared/schema";
import session from "express-session";
import SQLiteStore from "better-sqlite3-session-store";
import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "data.db"));
const SQLiteStoreSession = SQLiteStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPost(userId: number, content: string, imageUrl: string | null): Promise<Post>;
  getPosts(): Promise<PostWithUser[]>;
  getPost(id: number): Promise<PostWithUser | undefined>;
  createComment(postId: number, userId: number, content: string): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<CommentWithUser[]>;
  sessionStore: session.Store;
}

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    avatarUrl TEXT
  );
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    content TEXT,
    imageUrl TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER,
    userId INTEGER,
    content TEXT,
    createdAt TEXT,
    FOREIGN KEY(postId) REFERENCES posts(id),
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

export class DiskStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new SQLiteStoreSession({
      db: db,
      table: 'sessions'
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = db.prepare(
      'INSERT INTO users (username, password, avatarUrl) VALUES (?, ?, ?)'
    ).run(
      insertUser.username,
      insertUser.password,
      "https://images.unsplash.com/photo-1708860028064-3303a016e88f"
    );
    return this.getUser(result.lastInsertRowid as number) as Promise<User>;
  }

  async createPost(userId: number, content: string, imageUrl: string | null): Promise<Post> {
    const result = db.prepare(
      'INSERT INTO posts (userId, content, imageUrl, createdAt) VALUES (?, ?, ?, ?)'
    ).run(userId, content, imageUrl, new Date().toISOString());
    return db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  }

  async getPosts(): Promise<PostWithUser[]> {
    const posts = db.prepare(`
      SELECT posts.*, users.* 
      FROM posts 
      JOIN users ON posts.userId = users.id 
      ORDER BY posts.createdAt DESC
    `).all();
    return posts.map(row => ({
      id: row.id,
      content: row.content,
      imageUrl: row.imageUrl,
      createdAt: new Date(row.createdAt),
      userId: row.userId,
      user: {
        id: row.userId,
        username: row.username,
        password: row.password,
        avatarUrl: row.avatarUrl
      }
    }));
  }

  async getPost(id: number): Promise<PostWithUser | undefined> {
    const post = db.prepare(`
      SELECT posts.*, users.*
      FROM posts
      JOIN users ON posts.userId = users.id
      WHERE posts.id = ?
    `).get(id);
    if (!post) return undefined;
    return {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: new Date(post.createdAt),
      userId: post.userId,
      user: {
        id: post.userId,
        username: post.username,
        password: post.password,
        avatarUrl: post.avatarUrl
      }
    };
  }

  async createComment(postId: number, userId: number, content: string): Promise<Comment> {
    const result = db.prepare(
      'INSERT INTO comments (postId, userId, content, createdAt) VALUES (?, ?, ?, ?)'
    ).run(postId, userId, content, new Date().toISOString());
    return db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
  }

  async getCommentsByPost(postId: number): Promise<CommentWithUser[]> {
    const comments = db.prepare(`
      SELECT comments.*, users.*
      FROM comments
      JOIN users ON comments.userId = users.id
      WHERE comments.postId = ?
      ORDER BY comments.createdAt ASC
    `).all(postId);
    return comments.map(row => ({
      id: row.id,
      postId: row.postId,
      content: row.content,
      createdAt: new Date(row.createdAt),
      userId: row.userId,
      user: {
        id: row.userId,
        username: row.username,
        password: row.password,
        avatarUrl: row.avatarUrl
      }
    }));
  }
}

export const storage = new DiskStorage();
