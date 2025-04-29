import { pgTable, text, serial, integer, boolean, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Image Processing Schema
export const imageFiles = pgTable("image_files", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalPath: text("original_path").notNull(),
  processedPath: text("processed_path"),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  uploadDate: text("upload_date").notNull(),
  processingOptions: jsonb("processing_options"),
  isProcessed: boolean("is_processed").default(false),
  processingError: text("processing_error"),
});

export const insertImageFileSchema = createInsertSchema(imageFiles).omit({
  id: true,
  processedPath: true,
  isProcessed: true,
  processingError: true,
});

export type InsertImageFile = z.infer<typeof insertImageFileSchema>;
export type ImageFile = typeof imageFiles.$inferSelect;

// Tabular Data Schema
export const tabularFiles = pgTable("tabular_files", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalPath: text("original_path").notNull(),
  processedPath: text("processed_path"),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  uploadDate: text("upload_date").notNull(),
  processingOptions: jsonb("processing_options"),
  isProcessed: boolean("is_processed").default(false),
  processingError: text("processing_error"),
  summary: jsonb("summary"),
});

export const insertTabularFileSchema = createInsertSchema(tabularFiles).omit({
  id: true,
  processedPath: true,
  isProcessed: true,
  processingError: true,
  summary: true,
});

export type InsertTabularFile = z.infer<typeof insertTabularFileSchema>;
export type TabularFile = typeof tabularFiles.$inferSelect;

// Processing Job Schema
export const processingJobs = pgTable("processing_jobs", {
  id: serial("id").primaryKey(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  status: text("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
  totalFiles: integer("total_files").notNull(),
  processedFiles: integer("processed_files").default(0),
  processingTime: integer("processing_time"),
  errorMessage: text("error_message"),
});

export const insertProcessingJobSchema = createInsertSchema(processingJobs).omit({
  id: true,
  endTime: true,
  processedFiles: true,
  processingTime: true,
  errorMessage: true,
});

export type InsertProcessingJob = z.infer<typeof insertProcessingJobSchema>;
export type ProcessingJob = typeof processingJobs.$inferSelect;

// Image processing options schema
export const imageProcessingOptionsSchema = z.object({
  resize: z.boolean().default(false),
  normalize: z.boolean().default(false),
  grayscale: z.boolean().default(false),
  noiseReduction: z.boolean().default(false),
  edgeDetection: z.boolean().default(false),
  customParameters: z.string().optional(),
});

export type ImageProcessingOptions = z.infer<typeof imageProcessingOptionsSchema>;

// Tabular data processing options schema
export const tabularProcessingOptionsSchema = z.object({
  missingValues: z.boolean().default(false),
  standardize: z.boolean().default(false),
  encodeCategorical: z.boolean().default(false),
  dropDuplicates: z.boolean().default(false),
  outlierDetection: z.boolean().default(false),
  customParameters: z.string().optional(),
});

export type TabularProcessingOptions = z.infer<typeof tabularProcessingOptionsSchema>;
