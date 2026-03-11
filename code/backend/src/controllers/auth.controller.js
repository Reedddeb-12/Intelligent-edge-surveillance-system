// Authentication Controller
const User = require('../models/User.model');
const logger = require('../config/logger');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
     try {
          const { name, email, password, phone, organization } = req.body;

          // Check if user already exists
          const userExists = await User.findOne({ email });
          if (userExists) {
               return res.status(400).json({
                    success: false,
                    message: 'User already exists'
               });
          }

          // Create user
          const user = await User.create({
               name,
               email,
               password,
               phone,
               organization
          });

          // Generate tokens
          const token = user.generateAuthToken();
          const refreshToken = user.generateRefreshToken();

          // Save refresh token to user
          user.refreshToken = refreshToken;
          await user.save({ validateBeforeSave: false });

          res.status(201).json({
               success: true,
               token,
               refreshToken,
               data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
               }
          });

     } catch (error) {
          logger.error('Register error:', error);
          next(error);
     }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
     try {
          const { email, password } = req.body;

          if (!email || !password) {
               return res.status(400).json({
                    success: false,
                    message: 'Please provide email and password'
               });
          }

          // Check user
          const user = await User.findOne({ email }).select('+password');
          if (!user) {
               return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
               });
          }

          // Check password
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
               return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
               });
          }

          // Generate tokens
          const token = user.generateAuthToken();
          const refreshToken = user.generateRefreshToken();

          // Save refresh token to user
          user.refreshToken = refreshToken;
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });

          res.json({
               success: true,
               token,
               refreshToken,
               data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
               }
          });

     } catch (error) {
          logger.error('Login error:', error);
          next(error);
     }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
     try {
          const user = await User.findById(req.user.id);

          user.refreshToken = undefined;
          await user.save({ validateBeforeSave: false });

          res.json({
               success: true,
               message: 'Logged out successfully'
          });

     } catch (error) {
          logger.error('Logout error:', error);
          next(error);
     }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
     try {
          const user = await User.findById(req.user.id);
          res.json({
               success: true,
               data: user
          });
     } catch (error) {
          logger.error('Get profile error:', error);
          next(error);
     }
};

// @desc    Update profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
     try {
          const allowedUpdates = ['name', 'phone', 'organization', 'preferences'];
          const updates = {};

          Object.keys(req.body).forEach(key => {
               if (allowedUpdates.includes(key)) {
                    updates[key] = req.body[key];
               }
          });

          const user = await User.findByIdAndUpdate(req.user.id, updates, {
               new: true,
               runValidators: true
          });

          res.json({
               success: true,
               data: user
          });

     } catch (error) {
          logger.error('Update profile error:', error);
          next(error);
     }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
     try {
          const { currentPassword, newPassword } = req.body;

          const user = await User.findById(req.user.id).select('+password');

          const isMatch = await user.comparePassword(currentPassword);
          if (!isMatch) {
               return res.status(401).json({
                    success: false,
                    message: 'Incorrect current password'
               });
          }

          user.password = newPassword;
          await user.save();

          res.json({
               success: true,
               message: 'Password changed successfully'
          });

     } catch (error) {
          logger.error('Change password error:', error);
          next(error);
     }
};

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
     try {
          const { refreshToken } = req.body;

          if (!refreshToken) {
               return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required'
               });
          }

          // Verify refresh token
          const user = await User.findOne({ refreshToken }).select('+refreshToken');
          if (!user) {
               return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
               });
          }

          // Generate new token
          const newToken = user.generateAuthToken();

          res.json({
               success: true,
               token: newToken
          });

     } catch (error) {
          logger.error('Refresh token error:', error);
          next(error);
     }
};
