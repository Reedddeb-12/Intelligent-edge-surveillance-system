// IoT Device Controller
const Device = require('../models/Device.model');
const logger = require('../config/logger');

// @desc    Register new device
// @route   POST /api/v1/devices/register
// @access  Private
exports.registerDevice = async (req, res, next) => {
     try {
          const { deviceId, name, type, location, battery, metadata } = req.body;

          // Check if deviceId is unique
          const deviceExists = await Device.findOne({ deviceId });
          if (deviceExists) {
               return res.status(400).json({
                    success: false,
                    message: 'Device with this ID already exists'
               });
          }

          const device = await Device.create({
               deviceId,
               name,
               type,
               location,
               battery,
               metadata,
               user: req.user.id
          });

          res.status(201).json({
               success: true,
               data: device
          });

     } catch (error) {
          logger.error('Register device error:', error);
          next(error);
     }
};

// @desc    Get all devices for user
// @route   GET /api/v1/devices
// @access  Private
exports.getDevices = async (req, res, next) => {
     try {
          const devices = await Device.find({ user: req.user.id });

          res.json({
               success: true,
               data: devices,
               count: devices.length
          });

     } catch (error) {
          logger.error('Get devices error:', error);
          next(error);
     }
};

// @desc    Update device status
// @route   PUT /api/v1/devices/:deviceId/status
// @access  Private
exports.updateDeviceStatus = async (req, res, next) => {
     try {
          const { deviceId } = req.params;
          const { status, battery, location } = req.body;

          const device = await Device.findOneAndUpdate(
               { deviceId, user: req.user.id },
               {
                    status,
                    battery,
                    location,
                    lastSeen: new Date()
               },
               { new: true }
          );

          if (!device) {
               return res.status(404).json({
                    success: false,
                    message: 'Device not found'
               });
          }

          res.json({
               success: true,
               data: device
          });

     } catch (error) {
          logger.error('Update device status error:', error);
          next(error);
     }
};

// @desc    Send command to IoT device
// @route   POST /api/v1/devices/:deviceId/command
// @access  Private
exports.sendCommand = async (req, res, next) => {
     try {
          const { deviceId } = req.params;
          const { command, params } = req.body;

          const device = await Device.findOne({ deviceId, user: req.user.id });
          if (!device) {
               return res.status(404).json({
                    success: false,
                    message: 'Device not found'
               });
          }

          // Logic here to send command via WebSocket or MQTT
          const io = req.app.get('io');
          io.to(`device-${deviceId}`).emit('command', { command, params });

          res.json({
               success: true,
               message: `Command '${command}' sent to device ${deviceId}`
          });

     } catch (error) {
          logger.error('Send command error:', error);
          next(error);
     }
};
