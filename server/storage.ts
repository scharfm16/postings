import { User, InsertUser, Post, Comment, PostWithUser, CommentWithUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  sessionStore: session.Store;
  private currentUserId: number;
  private currentPostId: number;
  private currentCommentId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentCommentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      avatarUrl: "https://images.unsplash.com/photo-1708860028064-3303a016e88f"
    };
    this.users.set(id, user);
    return user;
  }

  async createPost(userId: number, content: string, imageUrl: string | null): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = {
      id,
      userId,
      content,
      imageUrl,
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getPosts(): Promise<PostWithUser[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => {
        const timeA = a.createdAt?.getTime() ?? 0;
        const timeB = b.createdAt?.getTime() ?? 0;
        return timeB - timeA;
      })
      .map(post => ({
        ...post,
        user: this.users.get(post.userId)!
      }));
  }

  async getPost(id: number): Promise<PostWithUser | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    return {
      ...post,
      user: this.users.get(post.userId)!
    };
  }

  async createComment(postId: number, userId: number, content: string): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = {
      id,
      postId,
      userId,
      content,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getCommentsByPost(postId: number): Promise<CommentWithUser[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => {
        const timeA = a.createdAt?.getTime() ?? 0;
        const timeB = b.createdAt?.getTime() ?? 0;
        return timeA - timeB;
      })
      .map(comment => ({
        ...comment,
        user: this.users.get(comment.userId)!
      }));
  }
}

export const storage = new MemStorage();