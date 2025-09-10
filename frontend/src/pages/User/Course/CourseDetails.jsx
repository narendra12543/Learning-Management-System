// src/components/User/Courses/CourseDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BookOpen, PlayCircle, FileText, Loader2, X } from "lucide-react";
import { useAuth } from "../../../contexts/Auth/AuthContext";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL; // do NOT append /courses here

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("videos");
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/v1/courses/public/${id}`);
        setCourse(res.data);
      } catch {
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // Fetch user enrollment & progress
  useEffect(() => {
    if (!token) return;
    const fetchEnrollment = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/v1/courses/user/enrolled`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const enrolledCourses = res.data?.data || [];
        const courseEnrolled = enrolledCourses.find((c) => c._id === id);
        if (courseEnrolled) {
          setEnrolled(true);
          setProgress(courseEnrolled.progress || 0);
          setCompletedVideos(courseEnrolled.completedVideos || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEnrollment();
  }, [id, token]);

  const handleVideoEnd = async (videoId) => {
    if (completedVideos.includes(videoId) || !token) return;

    try {
      const newCompleted = [...completedVideos, videoId];
      const videos = course.resources?.filter((r) => r.type === "video") || [];
      const newProgress = videos.length
        ? Math.round((newCompleted.length / videos.length) * 100)
        : 0;

      setCompletedVideos(newCompleted);
      setProgress(newProgress);

      await axios.put(
        `${API_BASE}/api/v1/courses/${id}/progress`,
        { userId: user._id, videoId, progress: newProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      toast.error("Failed to update progress");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin w-12 h-12 text-emerald-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center text-red-500 mt-10">❌ Course not found</div>
    );
  }

  const videos = course.resources?.filter((r) => r.type === "video") || [];
  const documents = course.resources?.filter((r) => r.type === "document") || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-shrink-0">
          {course.thumbnail && (
            <img
              src={`${API_BASE}${course.thumbnail}`}
              alt={course.title}
              className="w-72 rounded-xl shadow-lg"
            />
          )}
        </div>
        <div className="flex-1 space-y-3">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-green-100">{course.description}</p>
          <p className="text-sm">
            <span className="font-semibold">Category:</span> {course.category}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Instructor:</span>{" "}
            {course.instructor}
          </p>

          {/* Progress Bar */}
          {enrolled && (
            <div className="mt-3">
              <div className="text-sm mb-1">Progress: {progress}%</div>
              <div className="w-full bg-green-200 h-3 rounded-full">
                <div
                  className="bg-white h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate("/my-courses")}
            className="mt-4 px-5 py-2 bg-white text-green-700 font-semibold rounded-lg shadow hover:bg-green-50 transition"
          >
            ⬅ Back to My Courses
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-lg border border-green-100 rounded-2xl p-5 flex items-center gap-3 shadow">
          <BookOpen className="w-7 h-7 text-green-600" />
          <div>
            <p className="text-gray-500 text-sm">Total Resources</p>
            <p className="font-bold text-green-700 text-lg">
              {course.resources?.length || 0}
            </p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-lg border border-green-100 rounded-2xl p-5 flex items-center gap-3 shadow">
          <PlayCircle className="w-7 h-7 text-green-600" />
          <div>
            <p className="text-gray-500 text-sm">Videos</p>
            <p className="font-bold text-green-700 text-lg">{videos.length}</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-lg border border-green-100 rounded-2xl p-5 flex items-center gap-3 shadow">
          <FileText className="w-7 h-7 text-green-600" />
          <div>
            <p className="text-gray-500 text-sm">Documents</p>
            <p className="font-bold text-green-700 text-lg">
              {documents.length}
            </p>
          </div>
        </div>
      </div>

      {/* Access gating */}
      {!enrolled && (
        <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-800">
          <div className="text-lg font-semibold mb-2">Course locked</div>
          <p className="mb-4">You are not enrolled in this course. Please enroll to access videos and documents.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Browse and Enroll
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "videos"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-green-500"
            }`}
            onClick={() => setActiveTab("videos")}
          >
            🎥 Videos ({videos.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "documents"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-green-500"
            }`}
            onClick={() => setActiveTab("documents")}
          >
            📄 Documents ({documents.length})
          </button>
        </div>

        {/* Videos */}
        {activeTab === "videos" && enrolled && (
          <div className="space-y-4">
            {videos.map((video, idx) => (
              <div
                key={video._id}
                className="p-4 bg-white/60 backdrop-blur-lg border border-green-100 rounded-xl shadow"
              >
                <h3 className="font-semibold text-green-700 mb-1">
                  {video.title ? video.title : `Lec-${idx + 1}`}
                </h3>
                <video
                  controls
                  controlsList="nodownload"
                  className="w-full md:w-3/4 rounded mb-2 cursor-pointer"
                  src={`${API_BASE}${video.fileUrl}`}
                  onClick={() => setSelectedVideo(video)}
                  onEnded={() => handleVideoEnd(video._id)}
                />
                {completedVideos.includes(video._id) && (
                  <span className="text-green-600 font-semibold">✅ Completed</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Documents */}
        {activeTab === "documents" && enrolled && (
          <div className="space-y-4">
            {documents.map((doc, idx) => (
              <div
                key={doc._id}
                className="p-4 bg-white/60 backdrop-blur-lg border border-green-100 rounded-xl shadow flex justify-between items-center"
              >
                <h3 className="font-semibold text-green-700">
                  {doc.title ? doc.title : `Lec-${idx + 1}`}
                </h3>
                <a
                  href={`${API_BASE}${doc.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline flex items-center gap-1"
                >
                  <FileText size={16} /> View
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && enrolled && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] md:w-[70%] lg:w-[60%] relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600"
              onClick={() => setSelectedVideo(null)}
            >
              <X size={28} />
            </button>

            <div className="p-4">
              <h2 className="text-lg font-bold mb-3 text-green-700">
                {selectedVideo.title
                  ? selectedVideo.title
                  : `Lec-${
                      videos.findIndex((v) => v._id === selectedVideo._id) + 1
                    }`}
              </h2>
              <video
                controls
                autoPlay
                controlsList="nodownload"
                className="w-full rounded-lg"
                src={`${API_BASE}${selectedVideo.fileUrl}`}
                onEnded={() => handleVideoEnd(selectedVideo._id)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
