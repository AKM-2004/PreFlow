import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { 
  imageProcessingOptionsSchema, 
  tabularProcessingOptionsSchema,
  insertImageFileSchema,
  insertTabularFileSchema,
  insertProcessingJobSchema
} from "@shared/schema";
import { z } from "zod";

// Create upload directories if they don't exist
const createUploadDirs = async () => {
  const dirs = [
    'uploads',
    'uploads/images',
    'uploads/tabular',
    'uploads/processed'
  ];
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
};

// Set up multer for file uploads
const storage_config = multer.diskStorage({
  destination: async (req, file, cb) => {
    await createUploadDirs();
    
    // Determine destination based on file type
    const isImage = file.mimetype.startsWith('image/');
    const destination = isImage ? 'uploads/images' : 'uploads/tabular';
    
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Validate file types
    const isImage = file.mimetype.startsWith('image/');
    const isTabular = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.mimetype);
    
    if (file.fieldname === 'imageFiles' && !isImage) {
      return cb(new Error('Only image files are allowed for image processing'));
    }
    
    if (file.fieldname === 'tabularFiles' && !isTabular) {
      // Check extension for CSV files since they might be uploaded as octet-stream
      const ext = path.extname(file.originalname).toLowerCase();
      if (!['.csv', '.xls', '.xlsx'].includes(ext)) {
        return cb(new Error('Only CSV, XLS, and XLSX files are allowed for tabular data processing'));
      }
    }
    
    cb(null, true);
  }
});

// Basic image preprocessing simulation
async function preprocessImage(filePath: string, options: any): Promise<string> {
  // In a real implementation, this would use image processing libraries
  // For this demo, we'll just simulate the processing by copying the file
  
  const filename = path.basename(filePath);
  const processedPath = path.join('uploads/processed', `processed_${filename}`);
  
  // Copy the file to simulate processing
  await fs.copyFile(filePath, processedPath);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  return processedPath;
}

// Basic tabular data preprocessing simulation
async function preprocessTabularData(filePath: string, options: any): Promise<string> {
  // In a real implementation, this would parse and transform CSV/Excel files
  // For this demo, we'll just simulate the processing by copying the file
  
  const filename = path.basename(filePath);
  const processedPath = path.join('uploads/processed', `processed_${filename}`);
  
  // Copy the file to simulate processing
  await fs.copyFile(filePath, processedPath);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  return processedPath;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize upload directories
  await createUploadDirs();
  
  // API endpoint for processing data
  app.post('/api/process', upload.fields([
    { name: 'imageFiles', maxCount: 10 },
    { name: 'tabularFiles', maxCount: 10 }
  ]), async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Parse processing options
      let imageOptions;
      let tabularOptions;
      
      try {
        imageOptions = req.body.imageOptions 
          ? imageProcessingOptionsSchema.parse(JSON.parse(req.body.imageOptions))
          : {};
          
        tabularOptions = req.body.tabularOptions 
          ? tabularProcessingOptionsSchema.parse(JSON.parse(req.body.tabularOptions))
          : {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            message: 'Invalid processing options',
            details: error.errors
          });
        }
        throw error;
      }
      
      // Get uploaded files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageFiles = files['imageFiles'] || [];
      const tabularFiles = files['tabularFiles'] || [];
      
      if (imageFiles.length === 0 && tabularFiles.length === 0) {
        return res.status(400).json({ message: 'No files were uploaded' });
      }
      
      // Create a processing job
      const processingJob = await storage.createProcessingJob({
        startTime: new Date().toISOString(),
        status: 'processing',
        totalFiles: imageFiles.length + tabularFiles.length,
      });
      
      // Process image files
      const processedImages = [];
      for (const file of imageFiles) {
        try {
          // Save image file record
          const imageFile = await storage.createImageFile({
            fileName: file.originalname,
            originalPath: file.path,
            fileSize: file.size,
            fileType: file.mimetype,
            uploadDate: new Date().toISOString(),
            processingOptions: imageOptions,
          });
          
          // Process the image
          const processedPath = await preprocessImage(file.path, imageOptions);
          
          // Update the image file record
          const updatedImageFile = await storage.updateImageFile(imageFile.id, {
            processedPath,
            isProcessed: true,
          });
          
          processedImages.push(updatedImageFile);
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
      
      // Process tabular files
      const processedTabularFiles = [];
      for (const file of tabularFiles) {
        try {
          // Save tabular file record
          const tabularFile = await storage.createTabularFile({
            fileName: file.originalname,
            originalPath: file.path,
            fileSize: file.size,
            fileType: file.mimetype,
            uploadDate: new Date().toISOString(),
            processingOptions: tabularOptions,
          });
          
          // Process the tabular data
          const processedPath = await preprocessTabularData(file.path, tabularOptions);
          
          // Update the tabular file record
          const updatedTabularFile = await storage.updateTabularFile(tabularFile.id, {
            processedPath,
            isProcessed: true,
            summary: {
              rowCount: Math.floor(Math.random() * 1000) + 100,
              columnCount: Math.floor(Math.random() * 20) + 3,
              missingValues: Math.floor(Math.random() * 50),
              duplicateRows: Math.floor(Math.random() * 20),
            },
          });
          
          processedTabularFiles.push(updatedTabularFile);
        } catch (error) {
          console.error('Error processing tabular data:', error);
        }
      }
      
      // Update the processing job
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      
      const completedJob = await storage.updateProcessingJob(processingJob.id, {
        endTime: new Date().toISOString(),
        status: 'completed',
        processedFiles: processedImages.length + processedTabularFiles.length,
        processingTime,
      });
      
      // Return the results
      res.json({
        job: completedJob,
        images: processedImages,
        tabularFiles: processedTabularFiles,
        totalFiles: processedImages.length + processedTabularFiles.length,
        processingTime: processingTime.toFixed(1),
      });
      
    } catch (error) {
      console.error('Error processing data:', error);
      res.status(500).json({ 
        message: 'An error occurred while processing the data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // API endpoint to get a processed file
  app.get('/api/files/:id', async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      
      // Try to find as image file first
      let file = await storage.getImageFile(fileId);
      let isImage = true;
      
      // If not found, try as tabular file
      if (!file) {
        file = await storage.getTabularFile(fileId);
        isImage = false;
      }
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Send the processed file if available, otherwise the original
      const filePath = file.processedPath || file.originalPath;
      
      res.download(filePath, file.fileName);
      
    } catch (error) {
      console.error('Error retrieving file:', error);
      res.status(500).json({ 
        message: 'An error occurred while retrieving the file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
