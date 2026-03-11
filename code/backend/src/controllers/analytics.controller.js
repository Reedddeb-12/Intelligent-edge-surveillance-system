// Analytics Controller
const Threat = require('../models/Threat.model');
const Camera = require('../models/Camera.model');
const Alert = require('../models/Alert.model');
const logger = require('../config/logger');

// @desc    Get dashboard summary stats
// @route   GET /api/v1/analytics/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
     try {
          const userId = req.user.id;

          // Run counts in parallel
          const [totalThreats, totalAlerts, totalCameras, criticalThreats] = await Promise.all([
               Threat.countDocuments({ user: userId }),
               Alert.countDocuments({ user: userId }),
               Camera.countDocuments({ user: userId }),
               Threat.countDocuments({ user: userId, severity: 'CRITICAL' })
          ]);

          // Get last 24h stats
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const threatsLast24h = await Threat.countDocuments({ user: userId, createdAt: { $gte: dayAgo } });

          res.json({
               success: true,
               data: {
                    totalThreats,
                    totalAlerts,
                    totalCameras,
                    criticalThreats,
                    threatsLast24h
               }
          });

     } catch (error) {
          logger.error('Get dashboard stats error:', error);
          next(error);
     }
};

// @desc    Get threat detection trends
// @route   GET /api/v1/analytics/trends
// @access  Private
exports.getThreatTrends = async (req, res, next) => {
     try {
          const { days = 7 } = req.query;
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - parseInt(days));

          const trends = await Threat.aggregate([
               {
                    $match: {
                         user: req.user._id,
                         createdAt: { $gte: startDate }
                    }
               },
               {
                    $group: {
                         _id: {
                              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                         },
                         count: { $sum: 1 },
                         criticalCount: {
                              $sum: { $cond: [{ $eq: ["$severity", "CRITICAL"] }, 1, 0] }
                         }
                    }
               },
               { $sort: { "_id": 1 } }
          ]);

          res.json({
               success: true,
               data: trends
          });

     } catch (error) {
          logger.error('Get trends error:', error);
          next(error);
     }
};

// @desc    Get camera performance statistics
// @route   GET /api/v1/analytics/camera-performance
// @access  Private
exports.getCameraPerformance = async (req, res, next) => {
     try {
          const cameras = await Camera.find({ user: req.user.id })
               .select('name deviceId statistics status');

          res.json({
               success: true,
               data: cameras
          });

     } catch (error) {
          logger.error('Get camera performance error:', error);
          next(error);
     }
};

// @desc    Get heatmap data (coordinates)
// @route   GET /api/v1/analytics/heatmap
// @access  Private
exports.getHeatmapData = async (req, res, next) => {
     try {
          const threats = await Threat.find({ user: req.user.id })
               .select('location severity type createdAt')
               .sort({ createdAt: -1 })
               .limit(1000);

          const heatmapData = threats.map(t => ({
               lat: t.location.coordinates[1],
               lng: t.location.coordinates[0],
               weight: t.severity === 'CRITICAL' ? 1.0 : t.severity === 'HIGH' ? 0.7 : 0.4
          }));

          res.json({
               success: true,
               data: heatmapData
          });

     } catch (error) {
          logger.error('Get heatmap data error:', error);
          next(error);
     }
};
