// Camera Controller
const Camera = require('../models/Camera.model');
const logger = require('../config/logger');

// @desc    Create new camera
// @route   POST /api/v1/cameras
// @access  Private
exports.createCamera = async (req, res, next) => {
     try {
          const { deviceId, name, location, type, streamUrl } = req.body;

          // Check if deviceId is unique
          const cameraExists = await Camera.findOne({ deviceId });
          if (cameraExists) {
               return res.status(400).json({
                    success: false,
                    message: 'Camera with this Device ID already exists'
               });
          }

          const camera = await Camera.create({
               deviceId,
               name,
               location,
               type,
               streamUrl,
               user: req.user.id
          });

          res.status(201).json({
               success: true,
               data: camera
          });

     } catch (error) {
          logger.error('Create camera error:', error);
          next(error);
     }
};

// @desc    Get all cameras for user
// @route   GET /api/v1/cameras
// @access  Private
exports.getCameras = async (req, res, next) => {
     try {
          const cameras = await Camera.find({ user: req.user.id });

          res.json({
               success: true,
               data: cameras,
               count: cameras.length
          });

     } catch (error) {
          logger.error('Get cameras error:', error);
          next(error);
     }
};

// @desc    Get camera by ID
// @route   GET /api/v1/cameras/:id
// @access  Private
exports.getCameraById = async (req, res, next) => {
     try {
          const camera = await Camera.findById(req.params.id);

          if (!camera) {
               return res.status(404).json({
                    success: false,
                    message: 'Camera not found'
               });
          }

          // Check ownership
          if (camera.user.toString() !== req.user.id && req.user.role !== 'admin') {
               return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this camera'
               });
          }

          res.json({
               success: true,
               data: camera
          });

     } catch (error) {
          logger.error('Get camera by ID error:', error);
          next(error);
     }
};

// @desc    Update camera
// @route   PUT /api/v1/cameras/:id
// @access  Private
exports.updateCamera = async (req, res, next) => {
     try {
          let camera = await Camera.findById(req.params.id);

          if (!camera) {
               return res.status(404).json({
                    success: false,
                    message: 'Camera not found'
               });
          }

          // Check ownership
          if (camera.user.toString() !== req.user.id && req.user.role !== 'admin') {
               return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this camera'
               });
          }

          camera = await Camera.findByIdAndUpdate(req.params.id, req.body, {
               new: true,
               runValidators: true
          });

          res.json({
               success: true,
               data: camera
          });

     } catch (error) {
          logger.error('Update camera error:', error);
          next(error);
     }
};

// @desc    Delete camera
// @route   DELETE /api/v1/cameras/:id
// @access  Private
exports.deleteCamera = async (req, res, next) => {
     try {
          const camera = await Camera.findById(req.params.id);

          if (!camera) {
               return res.status(404).json({
                    success: false,
                    message: 'Camera not found'
               });
          }

          // Check ownership
          if (camera.user.toString() !== req.user.id && req.user.role !== 'admin') {
               return res.status(403).json({
                    success: false,
                    message: 'Not authorized to delete this camera'
               });
          }

          await camera.deleteOne();

          res.json({
               success: true,
               message: 'Camera deleted successfully'
          });

     } catch (error) {
          logger.error('Delete camera error:', error);
          next(error);
     }
};

// @desc    Update camera status
// @route   PUT /api/v1/cameras/:id/status
// @access  Private
exports.updateCameraStatus = async (req, res, next) => {
     try {
          const { status } = req.body;
          const camera = await Camera.findByIdAndUpdate(req.params.id, { status }, { new: true });

          if (!camera) {
               return res.status(404).json({
                    success: false,
                    message: 'Camera not found'
               });
          }

          res.json({
               success: true,
               data: camera
          });

     } catch (error) {
          logger.error('Update camera status error:', error);
          next(error);
     }
};
