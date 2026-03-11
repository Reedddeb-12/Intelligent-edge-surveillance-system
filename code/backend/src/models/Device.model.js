// IoT Device Model
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
     deviceId: {
          type: String,
          required: [true, 'Please provide a unique device ID'],
          unique: true,
          trim: true
     },
     name: {
          type: String,
          required: [true, 'Please provide a name'],
          trim: true
     },
     type: {
          type: String,
          enum: ['surveillance_camera', 'drone_interceptor', 'sdr_sensor', 'audio_detector'],
          default: 'surveillance_camera'
     },
     status: {
          type: String,
          enum: ['online', 'offline', 'low_battery', 'maintenance'],
          default: 'online'
     },
     user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true
     },
     location: {
          type: {
               type: String,
               enum: ['Point'],
               default: 'Point'
          },
          coordinates: {
               type: [Number],
               required: true
          }
     },
     battery: {
          type: Number,
          min: 0,
          max: 100,
          default: 100
     },
     lastSeen: {
          type: Date,
          default: Date.now
     },
     metadata: {
          type: Map,
          of: String
     }
}, {
     timestamps: true
});

// Index for geo queries
deviceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Device', deviceSchema);
