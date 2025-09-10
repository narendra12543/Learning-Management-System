import Course from "../../models/Course/Course.js";
import path from "path";

//Create Course
export const createCourse = async (req, res) => {
  try {
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);

    const { title, description, category, instructor, status, fees } = req.body;

    // Thumbnail - Fix path format
    let thumbnail = null;
    if (req.files?.thumbnail?.[0]) {
      // Normalize path separators and ensure it starts with /
      const thumbnailPath = req.files.thumbnail[0].path.replace(/\\/g, "/");
      thumbnail = thumbnailPath.startsWith("/") ? thumbnailPath : "/" + thumbnailPath;
      console.log("✅ Thumbnail path:", thumbnail);
    }

    //Resources
    const resources = (req.files?.resources || []).map((file, idx) => ({
      title: req.body[`resourceTitle_${idx}`] || file.originalname,
      description: req.body[`resourceDescription_${idx}`] || "",
      fileUrl: "/" + file.path.replace(/\\/g, "/"),
      type: file.mimetype.startsWith("video") ? "video" : "document",
    }));

    const course = new Course({
      title,
      description,
      category,
      instructor,
      status,
      thumbnail,
      resources,
      fees: fees ? parseInt(fees) : 100,
    });

    await course.save();
    console.log("✅ Course created with thumbnail:", thumbnail);
    res.status(201).json(course);
  } catch (err) {
    console.error("❌ Error creating course:", err);
    res.status(500).json({ error: "Error creating course", details: err.message });
  }
};

// Get All Courses
// Admin - Get all courses (active + draft + archived)
export const getAllCourses = async (req, res) => {
  try {
    console.log("📚 Admin fetching ALL courses...");
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error("❌ Error fetching all courses:", err);
    res.status(500).json({ error: "Error fetching all courses" });
  }
};

// Public - Get only active courses
export const getPublicCourses = async (req, res) => {
  try {
    console.log("📚 Public fetching ACTIVE courses...");
    const courses = await Course.find({ status: "active" }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error("❌ Error fetching active courses:", err);
    res.status(500).json({ error: "Error fetching active courses" });
  }
};

// Get Single Course
export const getCourseById = async (req, res) => {
  try {
    console.log(`📚 Fetching course by ID: ${req.params.id}`);
    const course = await Course.findById(req.params.id);

    if (!course) {
      console.log("❌ Course not found");
      return res.status(404).json({ error: "Course not found" });
    }

    // If course is draft/archived, block normal users but allow admin
    if (course.status !== "active" && req.user?.role !== "admin") {
      return res.status(403).json({ error: "This course is not available" });
    }

    console.log(`✅ Course found: ${course.title}`);
    res.json(course);
  } catch (err) {
    console.error("❌ Error fetching course:", err);
    res.status(500).json({ error: "Error fetching course" });
  }
};


//Update Course
export const updateCourse = async (req, res) => {
  try {
    console.log("FILES (update):", req.files);
    console.log("BODY (update):", req.body);

    const updates = { ...req.body };

    // Convert fees to number if provided
    if (updates.fees) {
      updates.fees = parseInt(updates.fees);
    }

    // Handle thumbnail update - Fix path format
    if (req.files?.thumbnail?.[0]) {
      const thumbnailPath = req.files.thumbnail[0].path.replace(/\\/g, "/");
      updates.thumbnail = thumbnailPath.startsWith("/") ? thumbnailPath : "/" + thumbnailPath;
      console.log("✅ Updated thumbnail path:", updates.thumbnail);
    }

    if (req.files?.resources) {
      const newResources = req.files.resources.map((file, idx) => ({
        title: req.body[`resourceTitle_${idx}`] || file.originalname,
        description: req.body[`resourceDescription_${idx}`] || "",
        fileUrl: "/" + file.path.replace(/\\/g, "/"),
        type: file.mimetype.startsWith("video") ? "video" : "document",
      }));

      updates.$push = { resources: { $each: newResources } };
    }

    const course = await Course.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    console.log("✅ Course updated with thumbnail:", course.thumbnail);
    res.json(course);
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ error: "Error updating course", details: err.message });
  }
};

//Delete Course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting course" });
  }
};

//Add Resource
export const addResource = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const newResources = (req.files || []).map((file, idx) => ({
      title: req.body[`resourceTitle_${idx}`] || file.originalname,
      description: req.body[`resourceDescription_${idx}`] || "",
      fileUrl: "/" + file.path.replace(/\\/g, "/"),
      type: file.mimetype.startsWith("video") ? "video" : "document",
    }));

    course.resources.push(...newResources);
    await course.save();

    res.json(course);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error adding resources", details: err.message });
  }
};

//Delete Resource
export const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    course.resources = course.resources.filter(
      (r) => r._id.toString() !== resourceId
    );
    await course.save();

    res.json(course);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting resource", details: err.message });
  }
};
