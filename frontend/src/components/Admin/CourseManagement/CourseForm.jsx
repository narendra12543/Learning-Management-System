import React, { useState, useEffect } from "react";
import { Plus, Trash, Folder, ChevronDown, ChevronRight, BookOpen, Tag, X } from "lucide-react";
import toast from "react-hot-toast";

const categories = [
  "MERN Stack",
  "React.js",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Full Stack Development",
  "Frontend Development",
  "Backend Development",
  "JavaScript",
  "Web Development Fundamentals",
  "HTML & CSS",
  "APIs & REST",
  "Authentication & Security",
  "Deployment & DevOps",
];

//Allowed file types mapped to categories
const resourceTypes = {
  PDF: [".pdf"],
  DOC: [".doc", ".docx"],
  PPT: [".ppt", ".pptx"],
  TXT: [".txt"],
  Images: [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"],
  Videos: [".mp4", ".avi", ".mov", ".mkv", ".webm"],
  "ZIP/RAR": [".zip", ".rar", ".7z"],
};

const CourseForm = ({ onSubmit, editingCourse }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    instructor: "",
    status: "draft",
    thumbnail: null,
    resources: [],
    fees: 0,
  });

  const [newResource, setNewResource] = useState({
    type: "",
    description: "",
    file: null,
  });

  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title || "",
        description: editingCourse.description || "",
        category: editingCourse.category || "",
        instructor: editingCourse.instructor || "",
        status: editingCourse.status || "draft",
        thumbnail: null,
        resources: editingCourse.resources || [],
        fees: editingCourse.fees || 0,
      });
    }
  }, [editingCourse]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "thumbnail") {
      setFormData((prev) => ({ ...prev, thumbnail: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleResourceChange = (e) => {
    const { name, value, files } = e.target;
    setNewResource((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const addResource = () => {
    if (!newResource.type || !newResource.file) return;

    const ext = `.${newResource.file.name.split(".").pop().toLowerCase()}`;
    const allowed = resourceTypes[newResource.type];

    if (!allowed.includes(ext)) {
      alert(`Only ${allowed.join(", ")} files are allowed for ${newResource.type}`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, newResource],
    }));
    setNewResource({ type: "", description: "", file: null });
  };

  const removeResource = (index) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();

      // Course fields
      ["title", "description", "category", "instructor", "status", "fees"].forEach(
        (key) => {
          if (formData[key]) data.append(key, formData[key]);
        }
      );

      // Thumbnail
      if (formData.thumbnail) {
        data.append("thumbnail", formData.thumbnail);
      }

      // Resources
      formData.resources.forEach((res, idx) => {
        if (res.file) {
          data.append("resources", res.file);
          data.append(`resourceType_${idx}`, res.type);
          data.append(`resourceDescription_${idx}`, res.description);
        }
      });

      console.log("📤 Submitting course form...");
      await onSubmit(data, !!editingCourse);
      console.log("✅ Course form submitted successfully");
      
    } catch (error) {
      console.error("❌ Course form submission error:", error);
      toast.error(editingCourse ? "Failed to update course" : "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-[60vh] overflow-y-auto px-2">
      {/* Course Information Section */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
          Course Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a compelling course title"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn and achieve in this course..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            >
              <option value="">Select a category</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Instructor *
            </label>
            <input
              type="text"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              placeholder="Instructor name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Course Fee (₹) *
            </label>
            <input
              type="number"
              name="fees"
              value={formData.fees || ""}
              onChange={handleChange}
              placeholder="Enter course price"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              min={0}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Course Thumbnail
            </label>
            <input
              type="file"
              name="thumbnail"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Upload a high-quality image (recommended: 1200x600px, max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-700">
        <button
          type="button"
          onClick={() => setResourcesOpen((prev) => !prev)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Folder className="w-5 h-5 mr-2 text-amber-600" />
            Course Resources
            {formData.resources.length > 0 && (
              <span className="ml-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs px-2 py-1 rounded-full">
                {formData.resources.length} file{formData.resources.length !== 1 ? 's' : ''}
              </span>
            )}
          </h3>
          {resourcesOpen ? (
            <ChevronDown className="w-5 h-5 text-amber-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-amber-600" />
          )}
        </button>

        {resourcesOpen && (
          <div className="mt-6 space-y-6">
            {/* Add Resource Form */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Add New Resource</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="type"
                  value={newResource.type}
                  onChange={handleResourceChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select resource type</option>
                  {Object.keys(resourceTypes).map((type, idx) => (
                    <option key={idx} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                
                <input
                  type="file"
                  name="file"
                  onChange={handleResourceChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
                  accept={
                    newResource.type
                      ? resourceTypes[newResource.type].join(",")
                      : Object.values(resourceTypes).flat().join(",")
                  }
                />
              </div>
              
              <textarea
                name="description"
                value={newResource.description}
                onChange={handleResourceChange}
                placeholder="Resource description (optional)"
                className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={2}
              />
              
              <button
                type="button"
                onClick={addResource}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                <Plus size={16} />
                Add Resource
              </button>
            </div>

            {/* Resource List */}
            {formData.resources.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Added Resources</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.resources.map((res, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {res.type}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {res.file?.name}
                          </span>
                        </div>
                        {res.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {res.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeResource(idx)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
              {editingCourse ? "Updating Course..." : "Creating Course..."}
            </div>
          ) : (
            editingCourse ? "Update Course" : "Create Course"
          )}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
