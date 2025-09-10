import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_BASE_PATH = path.join(__dirname, "..", "uploads");

// Ensure uploads directory exists
const ensureDirectory = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString("hex");
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `${baseName}-${timestamp}-${randomString}${extension}`;
};

// Move file from temp to destination
const moveFile = async (tempPath, destPath) => {
  await ensureDirectory(path.dirname(destPath));
  await fs.rename(tempPath, destPath);
};

// Get file stats
const getFileStats = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  } catch (error) {
    return null;
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (file, uniqueId) => {
  try {
    const userDir = path.join(UPLOADS_BASE_PATH, uniqueId, "profile");
    const filename = generateUniqueFilename(file.originalname);
    const destPath = path.join(userDir, filename);
    
    await moveFile(file.path, destPath);
    
    const relativePath = path.join(uniqueId, "profile", filename).replace(/\\/g, "/");
    const stats = await getFileStats(destPath);
    
    return {
      filename,
      originalName: file.originalname,
      path: relativePath,
      url: `/uploads/${relativePath}`,
      mimetype: file.mimetype,
      size: stats?.size || file.size,
      uploadedAt: new Date(),
      category: "profile",
      type: "image"
    };
  } catch (error) {
    console.error("Profile photo upload error:", error);
    throw error;
  }
};

// Upload course content (videos, PDFs, etc.)
export const uploadCourseContent = async (file, uniqueId, metadata) => {
  try {
    const { courseId, lessonId, contentType } = metadata;
    const courseDir = path.join(UPLOADS_BASE_PATH, uniqueId, "courses", courseId);
    
    let subDir = "content";
    if (lessonId) {
      subDir = path.join("lessons", lessonId);
    }
    
    const uploadDir = path.join(courseDir, subDir);
    const filename = generateUniqueFilename(file.originalname);
    const destPath = path.join(uploadDir, filename);
    
    await moveFile(file.path, destPath);
    
    const relativePath = path.join(uniqueId, "courses", courseId, subDir, filename).replace(/\\/g, "/");
    const stats = await getFileStats(destPath);
    
    return {
      filename,
      originalName: file.originalname,
      path: relativePath,
      url: `/uploads/${relativePath}`,
      mimetype: file.mimetype,
      size: stats?.size || file.size,
      uploadedAt: new Date(),
      category: "course_content",
      type: contentType,
      metadata: {
        courseId,
        lessonId
      }
    };
  } catch (error) {
    console.error("Course content upload error:", error);
    throw error;
  }
};

// Upload assignment
export const uploadAssignment = async (file, uniqueId, metadata) => {
  try {
    const { assignmentId, courseId, type } = metadata;
    const assignmentDir = path.join(UPLOADS_BASE_PATH, uniqueId, "assignments", courseId, assignmentId);
    const filename = generateUniqueFilename(file.originalname);
    const destPath = path.join(assignmentDir, filename);
    
    await moveFile(file.path, destPath);
    
    const relativePath = path.join(uniqueId, "assignments", courseId, assignmentId, filename).replace(/\\/g, "/");
    const stats = await getFileStats(destPath);
    
    return {
      filename,
      originalName: file.originalname,
      path: relativePath,
      url: `/uploads/${relativePath}`,
      mimetype: file.mimetype,
      size: stats?.size || file.size,
      uploadedAt: new Date(),
      category: "assignment",
      type,
      metadata: {
        assignmentId,
        courseId
      }
    };
  } catch (error) {
    console.error("Assignment upload error:", error);
    throw error;
  }
};

// Upload certificate
export const uploadCertificate = async (file, uniqueId, metadata) => {
  try {
    const { courseId, certificateType } = metadata;
    const certificateDir = path.join(UPLOADS_BASE_PATH, uniqueId, "certificates");
    const filename = generateUniqueFilename(file.originalname);
    const destPath = path.join(certificateDir, filename);
    
    await moveFile(file.path, destPath);
    
    const relativePath = path.join(uniqueId, "certificates", filename).replace(/\\/g, "/");
    const stats = await getFileStats(destPath);
    
    return {
      filename,
      originalName: file.originalname,
      path: relativePath,
      url: `/uploads/${relativePath}`,
      mimetype: file.mimetype,
      size: stats?.size || file.size,
      uploadedAt: new Date(),
      category: "certificate",
      type: certificateType,
      metadata: {
        courseId
      }
    };
  } catch (error) {
    console.error("Certificate upload error:", error);
    throw error;
  }
};

// Delete file
export const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(UPLOADS_BASE_PATH, filePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error("File deletion error:", error);
    return false;
  }
};

// Get user storage statistics
export const getUserStorageStats = async (uniqueId) => {
  try {
    const userDir = path.join(UPLOADS_BASE_PATH, uniqueId);
    
    const calculateDirSize = async (dirPath) => {
      let totalSize = 0;
      let fileCount = 0;
      
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item.name);
          
          if (item.isDirectory()) {
            const subDirStats = await calculateDirSize(itemPath);
            totalSize += subDirStats.size;
            fileCount += subDirStats.count;
          } else {
            const stats = await fs.stat(itemPath);
            totalSize += stats.size;
            fileCount++;
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
      
      return { size: totalSize, count: fileCount };
    };
    
    const totalStats = await calculateDirSize(userDir);
    
    // Get category-wise stats
    const categories = ["profile", "courses", "assignments", "certificates"];
    const categoryStats = {};
    
    for (const category of categories) {
      const categoryPath = path.join(userDir, category);
      categoryStats[category] = await calculateDirSize(categoryPath);
    }
    
    return {
      totalSize: totalStats.size,
      totalFiles: totalStats.count,
      categories: categoryStats,
      lastCalculated: new Date(),
    };
  } catch (error) {
    console.error("Storage stats calculation error:", error);
    return {
      totalSize: 0,
      totalFiles: 0,
      categories: {},
      lastCalculated: new Date(),
    };
  }
};
