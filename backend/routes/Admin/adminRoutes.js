import express from 'express';
import User from '../../models/User/User.js';
import CourseApplication from '../../models/Course/CourseApplication.js';
import Course from '../../models/Course/Course.js';
import { authenticate } from '../../middleware/Auth/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('enrolledCourses', 'title category fees')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${users.length} users`);

    // Get course applications for each user
    const usersWithApplications = await Promise.all(
      users.map(async (user) => {
        const applications = await CourseApplication.find({ user: user._id })
          .populate('course', 'title category fees instructor')
          .sort({ createdAt: -1 });
        
        console.log(`👤 User ${user.firstName} ${user.lastName}:`);
        console.log(`  - Applications: ${applications.length}`);
        console.log(`  - Enrolled Courses: ${user.enrolledCourses?.length || 0}`);
        
        return {
          ...user.toObject(),
          courseApplications: applications
        };
      })
    );

    res.json({
      success: true,
      users: usersWithApplications
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details with course applications
router.get('/users/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('enrolledCourses', 'title category fees instructor');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get course applications for this user
    const applications = await CourseApplication.find({ user: userId })
      .populate('course', 'title category fees instructor')
      .sort({ createdAt: -1 });

    console.log(`👤 User Details for ${user.firstName} ${user.lastName}:`);
    console.log(`  - Applications: ${applications.length}`);
    console.log(`  - Enrolled Courses: ${user.enrolledCourses?.length || 0}`);

    // Add applications to user object
    const userWithApplications = {
      ...user.toObject(),
      courseApplications: applications
    };

    res.json({
      success: true,
      user: userWithApplications
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Update user status
router.patch('/users/:userId/status', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log(`🔄 Admin updating user status: ${req.params.userId} to ${req.body.status}`);
    
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find user first to check if they exist
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user status
    const updateData = {
      status: status,
      accountStatus: status === 'suspended' ? 'suspended' : 'active'
    };

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    console.log(`✅ User ${user.email} account status updated to: ${status}`);

    res.json({
      success: true,
      message: `User ${status} successfully`,
      user
    });
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    res.status(500).json({ 
      error: 'Failed to update user status',
      details: error.message 
    });
  }
});

// Delete user
router.delete('/users/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting admin users
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Delete user's course applications
    await CourseApplication.deleteMany({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user course applications
router.get('/users/:userId/applications', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const applications = await CourseApplication.find({ user: userId })
      .populate('course', 'title category fees instructor')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ error: 'Failed to fetch user applications' });
  }
});

// Update course application status
router.patch('/applications/:applicationId/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await CourseApplication.findByIdAndUpdate(
      applicationId,
      { 
        status,
        reviewedAt: new Date(),
        reviewedBy: req.user.id
      },
      { new: true }
    ).populate('course', 'title category fees')
     .populate('user', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Get user statistics
router.get('/stats/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ accountStatus: 'active' });
    const suspendedUsers = await User.countDocuments({ accountStatus: 'suspended' });
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.find({})
      .select('firstName lastName email role status accountStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        pending: pendingUsers,
        byRole: usersByRole,
        recent: recentUsers
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

export default router;
