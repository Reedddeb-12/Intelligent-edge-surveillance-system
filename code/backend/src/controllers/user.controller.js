// User Controller
const User = require('../models/User.model');
const logger = require('../config/logger');

// @desc    Get all users (admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
     try {
          const { page = 1, limit = 10 } = req.query;

          const users = await User.find()
               .limit(limit * 1)
               .skip((page - 1) * limit)
               .sort({ createdAt: -1 });

          const count = await User.countDocuments();

          res.json({
               success: true,
               data: users,
               pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit)
               }
          });

     } catch (error) {
          logger.error('Get users error:', error);
          next(error);
     }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
     try {
          const user = await User.findById(req.params.id);

          if (!user) {
               return res.status(404).json({
                    success: false,
                    message: 'User not found'
               });
          }

          res.json({
               success: true,
               data: user
          });

     } catch (error) {
          logger.error('Get user by ID error:', error);
          next(error);
     }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
     try {
          const user = await User.findByIdAndUpdate(req.params.id, req.body, {
               new: true,
               runValidators: true
          });

          if (!user) {
               return res.status(404).json({
                    success: false,
                    message: 'User not found'
               });
          }

          res.json({
               success: true,
               data: user
          });

     } catch (error) {
          logger.error('Update user error:', error);
          next(error);
     }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
     try {
          const user = await User.findById(req.params.id);

          if (!user) {
               return res.status(404).json({
                    success: false,
                    message: 'User not found'
               });
          }

          await user.deleteOne();

          res.json({
               success: true,
               message: 'User deleted successfully'
          });

     } catch (error) {
          logger.error('Delete user error:', error);
          next(error);
     }
};
