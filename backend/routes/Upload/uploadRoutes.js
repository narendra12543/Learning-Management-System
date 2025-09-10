import express from "express";
import multer from "multer";
import { authenticate, requireUser } from "../../middleware/Auth/auth.js";
import {
  // uploadProfilePhoto,
  uploadCourseContent,
  uploadAssignment,
  uploadCertificate,
  deleteFile,
  getUserStorageStats,
} from "../../services/fileStorageService.js";
import { assignUniqueIdToUser } from "../../services/idGeneratorService.js";
import { uploadLimiter, validateFileUpload } from "../../middleware/lmsMiddleware.js";

const router = express.Router();

// Configure multer for temporary file storage
const upload = multer({
  dest: "uploads/temp/",
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type for LMS content'));
    }
  },
});

// ===== PROFILE UPLOAD ENDPOINTS =====

// // Upload profile photo
// router.post(
//   "/profile/photo",
//   authenticate,
//   requireUser,
//   upload.single("file"),
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//       }

//       // Validate file type for profile photo
//       if (!req.file.mimetype.startsWith("image/")) {
//         return res.status(400).json({ message: "Only image files are allowed for profile photos" });
//       }

//       // Ensure user has unique ID
//       const uniqueId = await assignUniqueIdToUser(req.user._id);

//       // Upload profile photo
//       const fileData = await uploadProfilePhoto(req.file, uniqueId);

//       res.json({
//         message: "Profile photo uploaded successfully",
//         file: fileData,
//       });
//     } catch (error) {
//       console.error("Profile photo upload error:", error);
//       res.status(500).json({
//         message: "Profile photo upload failed",
//         error: error.message,
//       });
//     }
//   }
// );

// ===== COURSE CONTENT UPLOAD ENDPOINTS =====

// Upload course video/content
router.post(
  "/course/content",
  authenticate,
  requireUser,
  uploadLimiter,
  upload.single("file"),
  validateFileUpload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { courseId, lessonId, contentType = "video" } = req.body;

      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }

      // Ensure user has unique ID
      const uniqueId = await assignUniqueIdToUser(req.user._id);

      // Upload course content
      const fileData = await uploadCourseContent(req.file, uniqueId, {
        courseId,
        lessonId,
        contentType
      });

      res.json({
        message: "Course content uploaded successfully",
        file: fileData,
      });
    } catch (error) {
      console.error("Course content upload error:", error);
      res.status(500).json({
        message: "Course content upload failed",
        error: error.message,
      });
    }
  }
);

// ===== ASSIGNMENT UPLOAD ENDPOINTS =====

// Upload assignment submission
router.post(
  "/assignment/submission",
  authenticate,
  requireUser,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { assignmentId, courseId } = req.body;

      if (!assignmentId || !courseId) {
        return res.status(400).json({ message: "Assignment ID and Course ID are required" });
      }

      // Ensure user has unique ID
      const uniqueId = await assignUniqueIdToUser(req.user._id);

      // Upload assignment
      const fileData = await uploadAssignment(req.file, uniqueId, {
        assignmentId,
        courseId,
        type: "submission"
      });

      res.json({
        message: "Assignment uploaded successfully",
        file: fileData,
      });
    } catch (error) {
      console.error("Assignment upload error:", error);
      res.status(500).json({
        message: "Assignment upload failed",
        error: error.message,
      });
    }
  }
);

// ===== CERTIFICATE UPLOAD ENDPOINTS =====

// Upload certificate
router.post(
  "/certificate",
  authenticate,
  requireUser,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { courseId, certificateType = "completion" } = req.body;

      // Ensure user has unique ID
      const uniqueId = await assignUniqueIdToUser(req.user._id);

      // Upload certificate
      const fileData = await uploadCertificate(req.file, uniqueId, {
        courseId,
        certificateType
      });

      res.json({
        message: "Certificate uploaded successfully",
        file: fileData,
      });
    } catch (error) {
      console.error("Certificate upload error:", error);
      res.status(500).json({
        message: "Certificate upload failed",
        error: error.message,
      });
    }
  }
);

// ===== FILE MANAGEMENT ENDPOINTS =====

// Delete file
router.delete("/file", authenticate, requireUser, async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ message: "File path is required" });
    }

    const success = await deleteFile(filePath);

    if (success) {
      res.json({ message: "File deleted successfully" });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("File deletion error:", error);
    res.status(500).json({
      message: "File deletion failed",
      error: error.message,
    });
  }
});

// Get user storage statistics
router.get("/storage/stats", authenticate, requireUser, async (req, res) => {
  try {
    // Ensure user has unique ID
    const uniqueId = await assignUniqueIdToUser(req.user._id);

    const stats = await getUserStorageStats(uniqueId);

    res.json({
      message: "Storage statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Storage stats error:", error);
    res.status(500).json({
      message: "Failed to get storage statistics",
      error: error.message,
    });
  }
});

export default router;
