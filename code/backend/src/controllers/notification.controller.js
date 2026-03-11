// Notification Controller
const { sendEmailAlert, sendSMSAlert } = require('../services/notification.service');
const logger = require('../config/logger');

// @desc    Send test email notification
// @route   POST /api/v1/notifications/email
// @access  Private
exports.sendEmailNotification = async (req, res, next) => {
     try {
          const { to, threat } = req.body;

          // If 'to' is not provide, use current user's email
          const targetUser = { ...req.user, email: to || req.user.email };

          const success = await sendEmailAlert(targetUser, threat || {
               type: 'Test Alert',
               confidence: 99,
               severity: 'LOW',
               createdAt: new Date(),
               location: { coordinates: [0, 0] }
          });

          res.json({
               success,
               message: success ? 'Email notification sent' : 'Failed to send email'
          });

     } catch (error) {
          logger.error('Send email notification error:', error);
          next(error);
     }
};

// @desc    Send test SMS notification
// @route   POST /api/v1/notifications/sms
// @access  Private
exports.sendSMSNotification = async (req, res, next) => {
     try {
          const { phone, threat } = req.body;

          const targetUser = { ...req.user, phone: phone || req.user.phone };

          if (!targetUser.phone) {
               return res.status(400).json({
                    success: false,
                    message: 'No phone number provided'
               });
          }

          const success = await sendSMSAlert(targetUser, threat || {
               type: 'Test Alert',
               confidence: 99,
               severity: 'LOW',
               createdAt: new Date()
          });

          res.json({
               success,
               message: success ? 'SMS notification sent' : 'Failed to send SMS'
          });

     } catch (error) {
          logger.error('Send SMS notification error:', error);
          next(error);
     }
};

// @desc    Run test for all notification channels
// @route   POST /api/v1/notifications/test
// @access  Private
exports.testNotifications = async (req, res, next) => {
     try {
          const testThreat = {
               type: 'System Test',
               confidence: 100,
               severity: 'LOW',
               createdAt: new Date(),
               location: { coordinates: [0, 0] }
          };

          const results = {
               email: await sendEmailAlert(req.user, testThreat),
               sms: req.user.phone ? await sendSMSAlert(req.user, testThreat) : 'Not configured'
          };

          res.json({
               success: true,
               results
          });

     } catch (error) {
          logger.error('Test notifications error:', error);
          next(error);
     }
};
