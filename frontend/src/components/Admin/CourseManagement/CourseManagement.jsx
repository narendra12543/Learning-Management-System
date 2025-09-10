import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  BookOpen,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  FileText,
  Video,
  Image as ImageIcon,
  TrendingUp,
  Award,
  Clock,
  X,
  CheckCircle,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";

import Modal from "./Modal";
import CourseForm from "./CourseForm";
import ResourceView from "./ResourceView";

import {
  getAllCoursesAdminApi,
  createCourseApi,
  updateCourseApi,
  deleteCourseApi,
} from "../../../services/Course/CourseService";

const BACKEND_URL = import.meta.env.VITE_API_URL;

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      console.log("📚 Fetching courses...");
      const { data } = await getAllCoursesAdminApi();
      console.log(
        "✅ Courses fetched successfully:",
        data?.length || 0,
        "courses"
      );
      setCourses(data || []);
    } catch (error) {
      console.error("❌ Failed to fetch courses:", error);
      if (error.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else {
        toast.error("Failed to load courses. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourseApi(id);
      fetchCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  // Edit course
  const handleEdit = (course) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  // View course
  const handleView = (course) => {
    setViewingCourse(course);
    setViewModal(true);
  };

  // Enhanced delete course with confirmation modal
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourseApi(courseToDelete._id);
      setSuccessMessage(
        `Course "${courseToDelete.title}" has been successfully deleted.`
      );
      setShowSuccessModal(true);
      setDeleteConfirmModal(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  // Enhanced submit with better error handling
  const handleSubmit = async (formData, isEdit) => {
    setSubmitLoading(true);
    try {
      console.log("📤 Submitting course data...");

      if (isEdit) {
        console.log("📝 Updating course:", editingCourse._id);
        await updateCourseApi(editingCourse._id, formData);
        setSuccessMessage(
          `Course "${editingCourse.title}" has been successfully updated!`
        );
      } else {
        console.log("➕ Creating new course");
        const response = await createCourseApi(formData);
        const courseTitle = formData.get("title") || "New Course";
        setSuccessMessage(
          `Course "${courseTitle}" has been successfully created!`
        );
      }

      setModalOpen(false);
      setShowSuccessModal(true);

      // Refresh courses list
      console.log("🔄 Refreshing courses list...");
      await fetchCourses();
    } catch (error) {
      console.error("❌ Failed to save course:", error);

      if (error.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else if (error.response?.status === 413) {
        toast.error("File size too large. Please use smaller files.");
      } else {
        toast.error(
          isEdit ? "Failed to update course" : "Failed to create course"
        );
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filtering
  const filteredCourses = courses.filter((course) => {
    return (
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterCategory ? course.category === filterCategory : true) &&
      (filterStatus ? course.status === filterStatus : true)
    );
  });

  // Pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Stats calculations
  const stats = [
    {
      label: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Active Courses",
      value: courses.filter((c) => c.status === "active").length,
      icon: TrendingUp,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Draft Courses",
      value: courses.filter((c) => c.status === "draft").length,
      icon: FileText,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Total Revenue",
      value: `₹${courses
        .reduce((sum, course) => sum + (course.fees || 0), 0)
        .toLocaleString()}`,
      icon: Award,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
      archived: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status] || styles.draft;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Course Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your educational content and track performance
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCourse(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusCircle size={20} />
              Add New Course
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      {IconComponent && (
                        <IconComponent
                          className={`w-6 h-6 ${stat.textColor}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses by title..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {[...new Set(courses.map((c) => c.category))].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Enhanced Courses Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Loading courses...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Please wait while we fetch your data
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b-2 border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Course Details
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Category & Status
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Price & Resources
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-5 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {currentCourses.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                              <BookOpen className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              No courses found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                              {searchQuery || filterCategory || filterStatus
                                ? "No courses match your current filters. Try adjusting your search criteria."
                                : "Get started by creating your first course to begin building your educational content library."}
                            </p>
                            {!searchQuery &&
                              !filterCategory &&
                              !filterStatus && (
                                <button
                                  onClick={() => {
                                    setEditingCourse(null);
                                    setModalOpen(true);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                                >
                                  <PlusCircle size={20} />
                                  Create Your First Course
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentCourses.map((course) => (
                        <tr
                          key={course._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                        >
                          {/* Course Details */}
                          <td className="px-6 py-6">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                {course.thumbnail ? (
                                  <img
                                    src={`${BACKEND_URL}${course.thumbnail}`}
                                    alt={course.title}
                                    className="h-16 w-16 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                                    onError={(e) => {
                                      console.log(
                                        "❌ Thumbnail failed to load:",
                                        course.thumbnail
                                      );
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "flex";
                                    }}
                                    crossOrigin="anonymous"
                                  />
                                ) : null}
                                <div
                                  className={`h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm ${
                                    course.thumbnail ? "hidden" : "flex"
                                  }`}
                                  style={{
                                    display: course.thumbnail ? "none" : "flex",
                                  }}
                                >
                                  <BookOpen className="w-8 h-8 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                                  {course.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                  {course.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category & Status */}
                          <td className="px-6 py-6">
                            <div className="space-y-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                                {course.category}
                              </span>
                              <div>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                                    course.status
                                  )}`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full mr-2 ${
                                      course.status === "active"
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                    }`}
                                  ></div>
                                  {course.status?.charAt(0)?.toUpperCase() +
                                    course.status?.slice(1)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Instructor */}
                          <td className="px-6 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-sm font-bold text-white">
                                  {course.instructor?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {course.instructor}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Instructor
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Price & Resources */}
                          <td className="px-6 py-6">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  ₹{(course.fees || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <FileText className="w-4 h-4 mr-1" />
                                <span>
                                  {course.resources?.length || 0} resources
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Created Date */}
                          <td className="px-6 py-6">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4 mr-2" />
                              <div>
                                <p className="font-medium">
                                  {formatDate(course.createdAt)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {new Date(
                                    course.createdAt
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-6">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleView(course)}
                                className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group"
                                title="View Course Details"
                              >
                                <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleEdit(course)}
                                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                                title="Edit Course"
                              >
                                <Edit className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(course)}
                                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                                title="Delete Course"
                              >
                                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {indexOfFirstCourse + 1} to{" "}
                      {Math.min(indexOfLastCourse, filteredCourses.length)} of{" "}
                      {filteredCourses.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentPage === index + 1
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modals */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {editingCourse ? "Edit Course" : "Create New Course"}
                  </h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    disabled={submitLoading}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-blue-100 mt-1">
                  {editingCourse
                    ? "Update your course information and content"
                    : "Fill in the details to create an engaging learning experience"}
                </p>
                {submitLoading && (
                  <div className="mt-2 flex items-center text-blue-100">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    <span className="text-sm">Saving course...</span>
                  </div>
                )}
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <CourseForm
                  onSubmit={handleSubmit}
                  editingCourse={editingCourse}
                />
              </div>
            </div>
          </div>
        )}

        {/* Enhanced View Course Modal */}
        {viewModal && viewingCourse && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Course Details</h2>
                  <button
                    onClick={() => setViewModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-200 mt-1">
                  Comprehensive course information and resources
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="space-y-8">
                  {/* Course Header */}
                  <div className="flex items-start space-x-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    {viewingCourse.thumbnail ? (
                      <img
                        src={`${BACKEND_URL}${viewingCourse.thumbnail}`}
                        alt={viewingCourse.title}
                        className="w-32 h-32 rounded-xl object-cover shadow-lg border-4 border-white dark:border-gray-600"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {viewingCourse.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{viewingCourse.instructor}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-green-600">
                            ₹{(viewingCourse.fees || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(viewingCourse.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <FileText className="w-4 h-4 mr-2" />
                          <span>
                            {viewingCourse.resources?.length || 0} resources
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Details Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-blue-600" />
                        Category
                      </h4>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {viewingCourse.category}
                      </span>
                    </div>
                    <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-green-600" />
                        Status
                      </h4>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(
                          viewingCourse.status
                        )}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            viewingCourse.status === "active"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        {viewingCourse.status?.charAt(0)?.toUpperCase() +
                          viewingCourse.status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-gray-600" />
                      Course Description
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {viewingCourse.description}
                    </p>
                  </div>

                  {/* Resources */}
                  <ResourceView course={viewingCourse} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Success!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {successMessage}
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmModal && courseToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Delete Course
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Are you sure you want to delete
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mb-4">
                "{courseToDelete.title}"?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mb-6">
                This action cannot be undone. All course data and resources will
                be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
                >
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
