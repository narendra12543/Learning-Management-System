import React, { useState, useEffect } from "react";
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Clock,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  DollarSign
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  getUserDetailsApi, 
  updateApplicationStatusApi 
} from "../../../services/User/UserService";

const UserDetailsModal = ({ user, onClose, onRefresh }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingApplication, setUpdatingApplication] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, [user._id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await getUserDetailsApi(user._id);
      setUserDetails(response.data.user);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingApplication(applicationId);
    try {
      await updateApplicationStatusApi(applicationId, newStatus);
      toast.success(`Application ${newStatus} successfully`);
      fetchUserDetails();
      onRefresh();
    } catch (error) {
      console.error("Failed to update application status:", error);
      toast.error("Failed to update application status");
    } finally {
      setUpdatingApplication(null);
    }
  };

  const getApplicationStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200",
    };
    return styles[status] || styles.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Loading user details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">User Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-blue-100 mt-1">Complete user profile and course applications</p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {userDetails && (
            <div className="space-y-8">
              {/* User Profile */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {userDetails.firstName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {userDetails.firstName} {userDetails.lastName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{userDetails.email}</span>
                      </div>
                      {userDetails.phone && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{userDetails.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Joined {formatDate(userDetails.createdAt)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        <span className="capitalize">{userDetails.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Applications */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Course Applications ({(userDetails.courseApplications?.length || 0) + (userDetails.enrolledCourses?.length || 0)})
                </h4>
                
                {/* Show Enrolled Courses First */}
                {userDetails.enrolledCourses && userDetails.enrolledCourses.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 text-green-600" />
                      Enrolled Courses ({userDetails.enrolledCourses.length})
                    </h5>
                    <div className="space-y-3">
                      {userDetails.enrolledCourses.map((course) => (
                        <div
                          key={course._id}
                          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h6 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {course.title}
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                  <Award className="w-4 h-4 mr-2" />
                                  <span>{course.category}</span>
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  <span>₹{course.fees || 0}</span>
                                </div>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Enrolled
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show Course Applications */}
                {userDetails.courseApplications && userDetails.courseApplications.length > 0 ? (
                  <div className="space-y-4">
                    <h5 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                      Applications ({userDetails.courseApplications.length})
                    </h5>
                    {userDetails.courseApplications.map((application) => (
                      <div
                        key={application._id}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {application.course?.title || "Course Deleted"}
                              </h5>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getApplicationStatusBadge(application.status)}`}>
                                {application.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {application.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {application.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                {application.status?.charAt(0)?.toUpperCase() + application.status?.slice(1)}
                              </span>
                            </div>
                            
                            {application.course && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <div className="flex items-center">
                                  <Award className="w-4 h-4 mr-2" />
                                  <span>{application.course.category}</span>
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  <span>₹{application.course.fees || 0}</span>
                                </div>
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-2" />
                                  <span>{application.course.instructor}</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <p>Applied: {formatDate(application.createdAt)}</p>
                              {application.applicationDate && (
                                <p>Last Updated: {formatDate(application.applicationDate)}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          {application.status === 'pending' && (
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleApplicationStatusUpdate(application._id, 'approved')}
                                disabled={updatingApplication === application._id}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                {updatingApplication === application._id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => handleApplicationStatusUpdate(application._id, 'rejected')}
                                disabled={updatingApplication === application._id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                {updatingApplication === application._id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !userDetails.enrolledCourses?.length && (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Course Activity
                      </h5>
                      <p className="text-gray-500 dark:text-gray-400">
                        This user hasn't applied to or enrolled in any courses yet.
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                  <h5 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Account Status
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`font-medium ${
                        userDetails.status === 'active' ? 'text-green-600' :
                        userDetails.status === 'inactive' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {userDetails.status?.charAt(0)?.toUpperCase() + userDetails.status?.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Role:</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {userDetails.role}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                  <h5 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-purple-600" />
                    Learning Stats
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Enrolled Courses:</span>
                      <span className="font-medium text-purple-600">
                        {userDetails.enrolledCourses?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Applications:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {userDetails.courseApplications?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Approved:</span>
                      <span className="font-medium text-green-600">
                        {userDetails.courseApplications?.filter(app => app.status === 'approved').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pending:</span>
                      <span className="font-medium text-yellow-600">
                        {userDetails.courseApplications?.filter(app => app.status === 'pending').length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
