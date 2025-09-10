import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCoursesApi } from "../../../services/Course/CourseService";
import { useAuth } from "../../../contexts/Auth/AuthContext";
import {
  BookOpen,
  Play,
  CheckCircle,
  User,
  Tag,
  Trophy,
  GraduationCap,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";

//Import shared Header and Sidebar
import Header from "../../../components/User/UserDashboard/Header";
import Sidebar from "../../../components/User/UserDashboard/Sidebar";

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false); // sidebar toggle
  const coursesPerPage = 6;
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const response = await getMyCoursesApi();
      console.log("📚 My Courses fetched:", response.data);
      setEnrolledCourses(response.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch my courses:", error);
      toast.error("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(enrolledCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const currentCourses = enrolledCourses.slice(
    startIndex,
    startIndex + coursesPerPage
  );

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  // Determine API URL based on environment
  const getApiBaseUrl = () => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return import.meta.env.VITE_API_URL || "http://localhost:5000";
    }
    return import.meta.env.VITE_API_URL_PROD || "https://rmtjob.com";
  };

  const API_URL = getApiBaseUrl();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-emerald-100/50 
                      dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-700/50 p-6 
                      transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-emerald-100/50 
                    dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-700/50 transition-colors duration-300">
      {/*Global Header */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex pt-16 h-screen">
        {/*Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-0 lg:w-64 lg:flex lg:flex-col`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/*Main Content */}
        <div className="flex-1 lg:ml-0 overflow-y-auto h-[calc(100vh-4rem)] scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {/* Courses Content */}
          <div className="p-6">
            {/* Header Banner */}
            <div className="max-w-7xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 
                              rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      My Learning Journey
                    </h1>
                    <p className="text-green-100 text-lg">
                      Continue your progress and achieve your learning goals! 🎯
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <BookOpen className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {enrolledCourses.length}
                    </div>
                    <div className="text-sm text-green-100">Enrolled</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {user?.completedCourses?.length || 0}
                    </div>
                    <div className="text-sm text-green-100">Completed</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Trophy className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {user?.skillPoints || 0}
                    </div>
                    <div className="text-sm text-green-100">Points</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Target className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {Math.round(
                        ((user?.completedCourses?.length || 0) /
                          Math.max(enrolledCourses.length, 1)) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-sm text-green-100">Progress</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Section */}
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg 
                              rounded-2xl shadow-2xl border border-green-200/50 dark:border-gray-700/50 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <BookOpen className="w-8 h-8 text-green-600" />
                      My Enrolled Courses
                    </h2>

                    {/* Pagination Info */}
                    {totalPages > 1 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 
                                      bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        Page {currentPage} of {totalPages}
                      </div>
                    )}
                  </div>

                  {/* If no courses */}
                  {enrolledCourses.length === 0 ? (
                    <div className="text-center py-16">
                      <GraduationCap className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        No courses enrolled yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        Start your learning journey by enrolling in courses from
                        the dashboard. Discover new skills and achieve your
                        goals!
                      </p>
                      <button
                        onClick={handleBackToDashboard}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl 
                                   font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 
                                   transform hover:scale-105 shadow-lg"
                      >
                        Browse Courses
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Courses Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                        {currentCourses.map((course) => (
                          <div
                            key={course._id}
                            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden 
                                       hover:shadow-2xl transition-all duration-300 hover:scale-105 
                                       border border-green-200/50 dark:border-gray-700/50"
                          >
                            {/* Thumbnail */}
                            <div className="relative overflow-hidden">
                              {course.thumbnail ? (
                                <img
                                  src={`${API_URL}${course.thumbnail}`}
                                  alt={course.title}
                                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <div className="w-full h-48 bg-gradient-to-br from-green-400 to-emerald-600 
                                                flex items-center justify-center group-hover:from-green-500 
                                                group-hover:to-emerald-700 transition-colors duration-300">
                                  <BookOpen className="w-16 h-16 text-white" />
                                </div>
                              )}
                              <div className="absolute top-4 left-4">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold 
                                                 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 shadow-sm">
                                  Enrolled
                                </span>
                              </div>
                              <div className="absolute top-4 right-4">
                                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-xs text-white font-medium">
                                    4.8
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                                    <Tag className="w-4 h-4 mr-1" />
                                    {course.category}
                                  </span>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>12 weeks</span>
                                  </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                  {course.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                                  {course.description}
                                </p>
                              </div>

                              {/* Instructor */}
                              <div className="flex items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
                                <User className="w-4 h-4 mr-2" />
                                <span>
                                  Instructor:{" "}
                                  <span className="font-medium">
                                    {course.instructor}
                                  </span>
                                </span>
                              </div>

                              {/* Resources */}
                              {course.resources &&
                                course.resources.length > 0 && (
                                  <div className="flex items-center mb-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                    <Play className="w-4 h-4 mr-2" />
                                    <span>
                                      {course.resources.length} learning
                                      resources
                                    </span>
                                  </div>
                                )}

                              {/* Progress */}
                              <div className="mb-6">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  <span>Progress</span>
                                  <span className="font-medium">15%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-300"
                                    style={{ width: "15%" }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  2 of 12 lessons completed
                                </p>
                              </div>

                              {/* Action Button */}
                              <button
                                onClick={() => navigate(`/course/${course._id}`)}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl 
                                           hover:from-green-700 hover:to-emerald-700 transition-all duration-300 
                                           flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                              >
                                <Play className="w-5 h-5" />
                                Continue Learning
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                          <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                              currentPage === 1
                                ? "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 shadow-md hover:shadow-lg transform hover:scale-105"
                            }`}
                          >
                            <ChevronLeft className="w-5 h-5" />
                            Previous
                          </button>

                          <div className="flex items-center gap-2">
                            {[...Array(totalPages)].map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentPage(index + 1)}
                                className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                                  currentPage === index + 1
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
                                }`}
                              >
                                {index + 1}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                              currentPage === totalPages
                                ? "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 shadow-md hover:shadow-lg transform hover:scale-105"
                            }`}
                          >
                            Next
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End Main Content */}
      </div>
    </div>
  );
};

export default MyCourses;
