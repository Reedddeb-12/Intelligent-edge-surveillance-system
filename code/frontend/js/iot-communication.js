// IoT Communication Handler for Drone Defense System
class IoTCommunicationManager {
    constructor() {
        this.mqttClient = null;
        this.websocket = null;
        this.devices = new Map();
        this.isConnected = false;
        this.messageHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    // Initialize Socket.IO connection for real-time communication
    initializeWebSocket(url = 'http://localhost:5000') {
        try {
            // Use Socket.IO instead of native WebSocket
            this.websocket = io(url, {
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000
            });

            this.websocket.on('connect', () => {
                console.log('Socket.IO connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.sendMessage('system', { type: 'handshake', clientId: this.generateClientId() });
            });

            this.websocket.on('message', (data) => {
                this.handleMessage(data);
            });

            this.websocket.on(('connect_error'), (error) => {
                console.error('Socket.IO connection error:', error);
                this.isConnected = false;
            });

            this.websocket.on('disconnect', (reason) => {
                console.log('Socket.IO disconnected:', reason);
                this.isConnected = false;
            });

            // Listen for any topic dynamically if the backend supports it, 
            // or we'll handle it via the 'message' event and custom handlers.

            return true;
        } catch (error) {
            console.error('Failed to initialize Socket.IO:', error);
            return false;
        }
    }

    // Handled by Socket.IO automatically, but keeping for compatibility
    attemptReconnect(url) {
        // Socket.IO handles this via built-in reconnection logic
        console.log('Socket.IO is handling reconnection automatically');
    }

    // Send message through Socket.IO
    sendMessage(topic, data) {
        if (!this.isConnected || !this.websocket) {
            console.warn('Socket.IO not connected. Message queued.');
            return false;
        }

        const message = {
            topic: topic,
            data: data,
            timestamp: new Date().toISOString(),
            clientId: this.generateClientId()
        };

        try {
            // Socket.IO uses emit and handles JSON automatically
            this.websocket.emit('message', message);
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    }

    // Handle incoming messages
    handleMessage(rawMessage) {
        try {
            const message = JSON.parse(rawMessage);
            const handler = this.messageHandlers.get(message.topic);

            if (handler) {
                handler(message.data);
            } else {
                console.log('Received message:', message);
            }

            // Update device status if applicable
            if (message.deviceId) {
                this.updateDeviceStatus(message.deviceId, message.data);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    // Register message handler for specific topic
    onMessage(topic, handler) {
        this.messageHandlers.set(topic, handler);
        console.log(`Handler registered for topic: ${topic}`);
    }

    // Register IoT device
    registerDevice(deviceId, deviceInfo) {
        this.devices.set(deviceId, {
            id: deviceId,
            ...deviceInfo,
            status: 'online',
            lastSeen: new Date().toISOString(),
            battery: deviceInfo.battery || 100,
            location: deviceInfo.location || null
        });

        console.log(`Device registered: ${deviceId}`);
        this.sendMessage('device/register', { deviceId, deviceInfo });
    }

    // Update device status
    updateDeviceStatus(deviceId, status) {
        const device = this.devices.get(deviceId);
        if (device) {
            Object.assign(device, status, {
                lastSeen: new Date().toISOString()
            });
            console.log(`Device ${deviceId} status updated`);
        }
    }

    // Get device information
    getDevice(deviceId) {
        return this.devices.get(deviceId);
    }

    // Get all devices
    getAllDevices() {
        return Array.from(this.devices.values());
    }

    // Send command to device
    sendCommand(deviceId, command, params = {}) {
        const message = {
            deviceId: deviceId,
            command: command,
            params: params,
            timestamp: new Date().toISOString()
        };

        return this.sendMessage('device/command', message);
    }

    // Request device telemetry
    requestTelemetry(deviceId) {
        return this.sendCommand(deviceId, 'get_telemetry');
    }

    // Update device configuration
    updateDeviceConfig(deviceId, config) {
        return this.sendCommand(deviceId, 'update_config', config);
    }

    // Simulate MQTT-like publish/subscribe
    publish(topic, message) {
        return this.sendMessage(topic, message);
    }

    subscribe(topic, callback) {
        this.onMessage(topic, callback);
    }

    // Generate unique client ID
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Send alert to all devices
    broadcastAlert(alertType, message, severity = 'medium') {
        const alert = {
            type: alertType,
            message: message,
            severity: severity,
            timestamp: new Date().toISOString()
        };

        return this.sendMessage('alert/broadcast', alert);
    }

    // Request system status from all devices
    requestSystemStatus() {
        this.devices.forEach((device, deviceId) => {
            this.requestTelemetry(deviceId);
        });
    }

    // Disconnect and cleanup
    disconnect() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        this.isConnected = false;
        console.log('IoT Communication Manager disconnected');
    }

    // Get connection status
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            devices: this.devices.size,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    // Simulate device data for demo purposes
    simulateDeviceData() {
        const deviceIds = ['A1', 'B3', 'C2', 'D4', 'E5', 'F6'];

        deviceIds.forEach(id => {
            this.registerDevice(id, {
                name: `Unit ${id}`,
                type: 'surveillance_camera',
                battery: Math.floor(Math.random() * 100),
                location: {
                    lat: 28.6139 + (Math.random() - 0.5) * 0.01,
                    lng: 77.2090 + (Math.random() - 0.5) * 0.01
                }
            });
        });

        // Simulate periodic updates
        setInterval(() => {
            deviceIds.forEach(id => {
                const device = this.getDevice(id);
                if (device && Math.random() > 0.3) {
                    this.updateDeviceStatus(id, {
                        battery: Math.max(0, device.battery - Math.random() * 2),
                        status: device.battery > 10 ? 'online' : 'low_battery'
                    });
                }
            });
        }, 10000);
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IoTCommunicationManager;
}
