import IdCounter from "../models/User/IdCounter.js";
import User from "../models/User/User.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getNextId = async () => {
  try {
    let counter = await IdCounter.findOne();

    if (!counter) {
      console.log("Creating new ID counter starting from 1001");
      counter = new IdCounter({ currentId: 1001 });
      await counter.save();
      return 1001;
    }

    counter.currentId += 1;
    counter.lastUpdated = new Date();
    await counter.save();

    console.log(`Generated next ID: ${counter.currentId}`);
    return counter.currentId;
  } catch (error) {
    console.error("Error getting next ID:", error);
    throw new Error("Failed to generate unique ID");
  }
};

export const generateUniqueId = async () => {
  try {
    const nextId = await getNextId();
    const uniqueId = `TT${nextId}`;
    console.log(`Generated unique ID: ${uniqueId}`);
    return uniqueId;
  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw error;
  }
};

export const createUserFolder = async (uniqueId) => {
  try {
    // Get the absolute path to the backend directory
    const backendDir = path.resolve(__dirname, "..");
    const uploadsBasePath = path.join(backendDir, "uploads");

    console.log(`Backend directory: ${backendDir}`);
    console.log(`Uploads base path: ${uploadsBasePath}`);

    // Ensure base uploads directory exists
    await fs.mkdir(uploadsBasePath, { recursive: true });
    console.log(`✅ Created/verified uploads directory: ${uploadsBasePath}`);

    const userUploadsPath = path.join(uploadsBasePath, uniqueId);

    console.log(`Creating user folder at: ${userUploadsPath}`);

    // Create main user folder
    await fs.mkdir(userUploadsPath, { recursive: true });

    // Create subfolders for LMS content
    const subfolders = [
      "profile",
      "courses",
      "assignments",
      "certificates",
      "projects",
    ];

    for (const folder of subfolders) {
      const folderPath = path.join(userUploadsPath, folder);
      await fs.mkdir(folderPath, { recursive: true });
      console.log(`Created subfolder: ${folderPath}`);
    }

    // Create a welcome file to confirm folder creation
    const welcomeFile = path.join(userUploadsPath, "welcome.txt");
    const welcomeContent = `Welcome to your LMS folder!
User ID: ${uniqueId}
Created: ${new Date().toISOString()}
Folder Structure:
- profile/ (for profile pictures and documents)
- courses/ (for course materials)
- assignments/ (for assignment submissions)
- certificates/ (for earned certificates)
- projects/ (for project files)
    `;

    await fs.writeFile(welcomeFile, welcomeContent);

    console.log(
      `✅ Successfully created LMS folder structure for user: ${uniqueId}`
    );
    console.log(`📁 Main folder: ${userUploadsPath}`);
    return userUploadsPath;
  } catch (error) {
    console.error(`❌ Error creating user folder for ${uniqueId}:`, error);
    throw new Error(`Failed to create user folder: ${error.message}`);
  }
};

export const assignUniqueIdToUser = async (userId) => {
  try {
    console.log(`🔄 Starting unique ID assignment for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If user already has a unique ID, check if folder exists
    if (user.uniqueId) {
      console.log(`User already has unique ID: ${user.uniqueId}`);

      // Check if folder exists, create if not
      const backendDir = path.resolve(__dirname, "..");
      const userFolderPath = path.join(backendDir, "uploads", user.uniqueId);

      try {
        await fs.access(userFolderPath);
        console.log(`✅ Folder already exists for ${user.uniqueId}`);
      } catch {
        console.log(
          `📁 Creating missing folder for existing user ${user.uniqueId}`
        );
        await createUserFolder(user.uniqueId);
      }

      return user.uniqueId;
    }

    // Generate new unique ID
    let uniqueId;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      uniqueId = await generateUniqueId();
      const existingUser = await User.findOne({ uniqueId });

      if (!existingUser) {
        break;
      }

      attempts++;
      console.log(
        `Unique ID ${uniqueId} already exists, trying again... (attempt ${attempts})`
      );

      if (attempts >= maxAttempts) {
        throw new Error("Unable to generate unique ID after multiple attempts");
      }
    } while (attempts < maxAttempts);

    console.log(`🆔 Assigning unique ID ${uniqueId} to user ${userId}`);

    // Update user with unique ID
    user.uniqueId = uniqueId;
    await user.save();

    console.log(`💾 Saved unique ID to database for user ${userId}`);

    // Create user folder
    await createUserFolder(uniqueId);

    console.log(
      `✅ Successfully assigned unique ID ${uniqueId} to user ${userId} and created folder`
    );
    return uniqueId;
  } catch (error) {
    console.error(`❌ Error assigning unique ID to user ${userId}:`, error);
    throw new Error(`Failed to assign unique ID: ${error.message}`);
  }
};

export const initializeIdCounter = async () => {
  try {
    console.log("🔄 Initializing ID counter system...");

    // Create uploads directory
    const backendDir = path.resolve(__dirname, "..");
    const uploadsPath = path.join(backendDir, "uploads");

    await fs.mkdir(uploadsPath, { recursive: true });
    console.log(`✅ Created/verified uploads directory: ${uploadsPath}`);

    // Initialize counter
    const counter = await IdCounter.findOne();
    if (!counter) {
      await new IdCounter({ currentId: 1001 }).save();
      console.log("✅ ID counter initialized starting from 1001");
    } else {
      console.log(
        `✅ ID counter already initialized, current ID: ${counter.currentId}`
      );
    }

    console.log("✅ ID counter system initialization complete");
  } catch (error) {
    console.error("❌ Error initializing ID counter system:", error);
    throw error;
  }
};
