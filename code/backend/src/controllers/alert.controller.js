// Alert Controller
const Alert = require('../models/Alert.model');
const logger = require('../config/logger');

// @desc    Get all alerts for user
// @route   GET /api/v1/alerts
// @access  Private
exports.getAlerts = async (req, res, next) => {
     try {
          const { page = 1, limit = 20, status, type } = req.query;

          const query = { user: req.user.id };
          if (status) query.status = status;
          if (type) query.type = type;

          const alerts = await Alert.find(query)
               .populate('threat')
               .populate('camera', 'name deviceId')
               .sort({ createdAt: -1 })
               .limit(limit * 1)
               .skip((page - 1) * limit);

          const count = await Alert.countDocuments(query);
          const unreadCount = await Alert.countDocuments({ user: req.user.id, read: false });

          res.json({
               success: true,
               data: alerts,
               unreadCount,
               pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit)
               }
          });

     } catch (error) {
          logger.error('Get alerts error:', error);
          next(error);
     }
};

// @desc    Get single alert
// @route   GET /api/v1/alerts/:id
// @access  Private
exports.getAlertById = async (req, res, next) => {
     try {
          const alert = await Alert.findById(req.params.id)
               .populate('threat')
               .populate('camera');

          if (!alert) {
               return res.status(404).json({
                    success: false,
                    message: 'Alert not found'
               });
          }

          // Check ownership
          if (alert.user.toString() !== req.user.id && req.user.role !== 'admin') {
               return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this alert'
               });
          }

          res.json({
               success: true,
               data: alert
          });

     } catch (error) {
          logger.error('Get alert by ID error:', error);
          next(error);
     }
};

// @desc    Mark alert as read
// @route   PUT /api/v1/alerts/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
     try {
          const alert = await Alert.findById(req.params.id);

          if (!alert) {
               return res.status(404).json({
                    success: false,
                    message: 'Alert not found'
               });
          }

          // Check ownership
          if (alert.user.toString() !== req.user.id && req.user.role !== 'admin') {
               return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this alert'
               });
          }

          alert.read = true;
          alert.readAt = new Date();
          await alert.save();

          res.json({
               success: true,
               data: alert
          });

     } catch (error) {
          logger.error('Mark alert as read error:', error);
          next(error);
     }
};

// @desc    Delete alert
// @route   DELETE /api/v1/alerts/:id
// @access  Private
exports.deleteAlert = async (req, res, next) => {
     try {
          const alert = await Alert.findById(req.params.id);

          if (!alert) {
               return res.status(404).json({
                    success: false,
                    message: 'Alert not found'
               });
          }

          // Check ownership
          if (alert.user.toString() !== req.user.id && req.user.role !== 'admin') {
               return res.status(403).json({
                    success: false,
                    message: 'Not authorized to delete this alert'
               });
          }

          await alert.deleteOne();

          res.json({
               success: true,
               message: 'Alert deleted successfully'
          });

     } catch (error) {
          logger.error('Delete alert error:', error);
          next(error);
     }
};
