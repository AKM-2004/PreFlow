import { 
  users, type User, type InsertUser, 
  imageFiles, type ImageFile, type InsertImageFile,
  tabularFiles, type TabularFile, type InsertTabularFile,
  processingJobs, type ProcessingJob, type InsertProcessingJob
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Image file methods
  getImageFile(id: number): Promise<ImageFile | undefined>;
  getImageFiles(): Promise<ImageFile[]>;
  createImageFile(file: InsertImageFile): Promise<ImageFile>;
  updateImageFile(id: number, updates: Partial<ImageFile>): Promise<ImageFile>;
  deleteImageFile(id: number): Promise<void>;
  
  // Tabular file methods
  getTabularFile(id: number): Promise<TabularFile | undefined>;
  getTabularFiles(): Promise<TabularFile[]>;
  createTabularFile(file: InsertTabularFile): Promise<TabularFile>;
  updateTabularFile(id: number, updates: Partial<TabularFile>): Promise<TabularFile>;
  deleteTabularFile(id: number): Promise<void>;
  
  // Processing job methods
  getProcessingJob(id: number): Promise<ProcessingJob | undefined>;
  getProcessingJobs(): Promise<ProcessingJob[]>;
  createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob>;
  updateProcessingJob(id: number, updates: Partial<ProcessingJob>): Promise<ProcessingJob>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private imageFiles: Map<number, ImageFile>;
  private tabularFiles: Map<number, TabularFile>;
  private processingJobs: Map<number, ProcessingJob>;
  
  private currentUserId: number;
  private currentImageFileId: number;
  private currentTabularFileId: number;
  private currentProcessingJobId: number;

  constructor() {
    this.users = new Map();
    this.imageFiles = new Map();
    this.tabularFiles = new Map();
    this.processingJobs = new Map();
    
    this.currentUserId = 1;
    this.currentImageFileId = 1;
    this.currentTabularFileId = 1;
    this.currentProcessingJobId = 1;
  }

  // User methods
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Image file methods
  async getImageFile(id: number): Promise<ImageFile | undefined> {
    return this.imageFiles.get(id);
  }
  
  async getImageFiles(): Promise<ImageFile[]> {
    return Array.from(this.imageFiles.values());
  }
  
  async createImageFile(file: InsertImageFile): Promise<ImageFile> {
    const id = this.currentImageFileId++;
    const imageFile: ImageFile = { 
      ...file, 
      id,
      isProcessed: false,
    };
    this.imageFiles.set(id, imageFile);
    return imageFile;
  }
  
  async updateImageFile(id: number, updates: Partial<ImageFile>): Promise<ImageFile> {
    const file = this.imageFiles.get(id);
    if (!file) {
      throw new Error(`Image file with ID ${id} not found`);
    }
    
    const updatedFile = { ...file, ...updates };
    this.imageFiles.set(id, updatedFile);
    return updatedFile;
  }
  
  async deleteImageFile(id: number): Promise<void> {
    if (!this.imageFiles.delete(id)) {
      throw new Error(`Image file with ID ${id} not found`);
    }
  }
  
  // Tabular file methods
  async getTabularFile(id: number): Promise<TabularFile | undefined> {
    return this.tabularFiles.get(id);
  }
  
  async getTabularFiles(): Promise<TabularFile[]> {
    return Array.from(this.tabularFiles.values());
  }
  
  async createTabularFile(file: InsertTabularFile): Promise<TabularFile> {
    const id = this.currentTabularFileId++;
    const tabularFile: TabularFile = { 
      ...file, 
      id,
      isProcessed: false,
    };
    this.tabularFiles.set(id, tabularFile);
    return tabularFile;
  }
  
  async updateTabularFile(id: number, updates: Partial<TabularFile>): Promise<TabularFile> {
    const file = this.tabularFiles.get(id);
    if (!file) {
      throw new Error(`Tabular file with ID ${id} not found`);
    }
    
    const updatedFile = { ...file, ...updates };
    this.tabularFiles.set(id, updatedFile);
    return updatedFile;
  }
  
  async deleteTabularFile(id: number): Promise<void> {
    if (!this.tabularFiles.delete(id)) {
      throw new Error(`Tabular file with ID ${id} not found`);
    }
  }
  
  // Processing job methods
  async getProcessingJob(id: number): Promise<ProcessingJob | undefined> {
    return this.processingJobs.get(id);
  }
  
  async getProcessingJobs(): Promise<ProcessingJob[]> {
    return Array.from(this.processingJobs.values());
  }
  
  async createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob> {
    const id = this.currentProcessingJobId++;
    const processingJob: ProcessingJob = { 
      ...job, 
      id,
      processedFiles: 0,
    };
    this.processingJobs.set(id, processingJob);
    return processingJob;
  }
  
  async updateProcessingJob(id: number, updates: Partial<ProcessingJob>): Promise<ProcessingJob> {
    const job = this.processingJobs.get(id);
    if (!job) {
      throw new Error(`Processing job with ID ${id} not found`);
    }
    
    const updatedJob = { ...job, ...updates };
    this.processingJobs.set(id, updatedJob);
    return updatedJob;
  }
}

export const storage = new MemStorage();
