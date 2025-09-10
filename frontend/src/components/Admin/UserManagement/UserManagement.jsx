import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar, 
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  getAllUsersApi, 
  updateUserStatusApi, 
  deleteUserApi 
} from "../../../services/User/UserService";
import UserDetailsModal from "./UserDetailsModal";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [suspendConfirm, setSuspendConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching users...');
      const response = await getAllUsersApi();
      console.log('Users response:', response.data);
      
      // Handle both possible response structures
      const users = response.data.users || response.data || [];
      setUsers(users);
      
      if (users.length === 0) {
        console.log('No users found');
      } else {
        console.log(`Successfully loaded ${users.length} users`);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      
      // More specific error handling
      if (error.response?.status === 404) {
        toast.error("User management endpoint not found. Please check backend configuration.");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to access user management.");
      } else if (error.response?.status === 401) {
        toast.error("Please login as admin to access user management.");
      } else {
        toast.error("Failed to load users. Please try again later.");
      }
      
      // Set empty array to prevent further errors
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      await updateUserStatusApi(userId, newStatus);
      toast.success(`User ${newStatus === 'suspended' ? 'suspended' : newStatus} successfully`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserApi(userId);
      toast.success("User deleted successfully");
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleSuspendUser = (user) => {
    setSuspendConfirm(user);
  };

  const confirmSuspendUser = async () => {
    if (suspendConfirm) {
      await handleStatusUpdate(suspendConfirm._id, 'suspended');
      setSuspendConfirm(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Stats
  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Active Users",
      value: users.filter(u => u.status === "active").length,
      icon: UserCheck,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Suspended Users",
      value: users.filter(u => u.status === "suspended").length,
      icon: UserX,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Admins",
      value: users.filter(u => u.role === "admin").length,
      icon: GraduationCap,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700",
      inactive: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700",
      suspended: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700",
    };
    return styles[status] || styles.pending;
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700",
      user: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
    };
    return styles[role] || styles.user;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage users, view their profiles and course applications
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
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
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            ))}
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
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>

            {/* Role Filter */}
            <select
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading users...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Please wait while we fetch user data</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b-2 border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/3">
                        User Details
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/6">
                        Role & Status
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/6">
                        Course Applications
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/6">
                        Joined Date
                      </th>
                      <th className="px-6 py-5 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {currentUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                              <Users className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                              {searchTerm || filterStatus !== "all" || filterRole !== "all"
                                ? "No users match your current filters. Try adjusting your search criteria."
                                : "No users have registered yet."
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                        >
                          {/* User Details */}
                          <td className="px-6 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-white font-bold text-lg">
                                    {user.firstName?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {user.firstName} {user.lastName}
                                </p>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Mail className="w-4 h-4 mr-1 text-gray-400" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role & Status */}
                          <td className="px-6 py-6">
                            <div className="space-y-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                                {user.role?.charAt(0)?.toUpperCase() + user.role?.slice(1)}
                              </span>
                              <div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user.status)}`}>
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    user.status === 'active' ? 'bg-green-500' : 
                                    user.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                                  }`}></div>
                                  {user.status?.charAt(0)?.toUpperCase() + user.status?.slice(1)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Course Applications */}
                          <td className="px-6 py-6">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                                <span>
                                  {Array.isArray(user.courseApplications) ? user.courseApplications.length : 0} applications
                                </span>
                              </div>
                              {user.courseApplications && Array.isArray(user.courseApplications) && user.courseApplications.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                    <span>
                                      {user.courseApplications.filter(app => app.status === 'approved').length} approved
                                    </span>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <Clock className="w-3 h-3 mr-1 text-yellow-500" />
                                    <span>
                                      {user.courseApplications.filter(app => app.status === 'pending').length} pending
                                    </span>
                                  </div>
                                </div>
                              )}
                              {user.enrolledCourses && Array.isArray(user.enrolledCourses) && user.enrolledCourses.length > 0 && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <GraduationCap className="w-3 h-3 mr-1 text-purple-500" />
                                  <span>
                                    {user.enrolledCourses.length} enrolled
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Joined Date */}
                          <td className="px-6 py-6">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4 mr-2" />
                              <div>
                                <p className="font-medium">{formatDate(user.createdAt)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {new Date(user.createdAt).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-6">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleViewDetails(user)}
                                className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              </button>
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleSuspendUser(user)}
                                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                                  title="Suspend User"
                                >
                                  <UserX className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                              ) : user.status === 'suspended' ? (
                                <button
                                  onClick={() => handleStatusUpdate(user._id, 'active')}
                                  className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 group"
                                  title="Activate User"
                                >
                                  <UserCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusUpdate(user._id, 'active')}
                                  className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 group"
                                  title="Activate User"
                                >
                                  <UserCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteConfirm(user)}
                                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                                title="Delete User"
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
                      Showing {indexOfFirstUser + 1} to{" "}
                      {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                      {filteredUsers.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

        {/* User Details Modal */}
        {showDetailsModal && selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => setShowDetailsModal(false)}
            onRefresh={fetchUsers}
          />
        )}

        {/* Suspend Confirmation Modal */}
        {suspendConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX className="w-10 h-10 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Suspend User Account</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Are you sure you want to suspend
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mb-4">
                "{suspendConfirm.firstName} {suspendConfirm.lastName}"?
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  <strong>This will:</strong>
                </p>
                <ul className="text-sm text-orange-700 dark:text-orange-400 mt-2 text-left list-disc list-inside space-y-1">
                  <li>Prevent the user from logging in</li>
                  <li>Block access to all platform features</li>
                  <li>Keep their data intact for future reactivation</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSuspendConfirm(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSuspendUser}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
                >
                  Suspend Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete User Account</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Are you sure you want to permanently delete
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mb-4">
                "{deleteConfirm.firstName} {deleteConfirm.lastName}"?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>⚠️ This action cannot be undone!</strong>
                </p>
                <ul className="text-sm text-red-700 dark:text-red-400 mt-2 text-left list-disc list-inside space-y-1">
                  <li>All user data will be permanently deleted</li>
                  <li>Course enrollments will be removed</li>
                  <li>Application history will be lost</li>
                  <li>This action is irreversible</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(deleteConfirm._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;


