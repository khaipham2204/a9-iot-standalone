// Dashboard JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeCharts();
    initializeGauges();
    initializeMenu();
    addInteractivity();
    animateNumbers();
    
    // Create the usage gauge
    createUsageGauge();
    
    // Animate and create sensor gauges
    animateGauges();
});

function initializeCharts() {
    // Create line chart
    createLineChart();
}

function initializeMenu() {
    // Initialize dashboard menu functionality
    const menuButtons = document.querySelectorAll('.menu-btn[data-action]');
    
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            handleMenuAction(action, this);
        });
    });
}

function handleMenuAction(action, buttonElement) {
    // Remove active class from all buttons
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    buttonElement.classList.add('active');
    
    switch(action) {
        case 'dashboard':
            showDashboardView();
            break;
        case 'live-data':
            showLiveDataView();
            break;
        case 'alerts':
            showAlertsModal();
            break;
        case 'export':
            handleDataExport();
            break;
        case 'calibration':
            showCalibrationModal();
            break;
        case 'settings':
            showSettingsModal();
            break;
        case 'more':
            showMoreMenu();
            break;
        default:
            console.log('Unknown action:', action);
    }
}

function showDashboardView() {
    // Show main dashboard content
    document.querySelector('.sensor-gauges-container').style.display = 'flex';
    document.querySelector('.chart-section').style.display = 'flex';
    showNotification('Dashboard View', 'success');
}

function showLiveDataView() {
    // Toggle real-time data view
    const isLiveMode = document.body.classList.toggle('live-data-mode');
    showNotification(
        isLiveMode ? 'Live Data Mode Enabled' : 'Live Data Mode Disabled', 
        'info'
    );
    
    if (isLiveMode) {
        startLiveDataUpdates();
    } else {
        stopLiveDataUpdates();
    }
}

function showAlertsModal() {
    // Create and show alerts modal
    const alertsData = [
        { level: 'warning', sensor: 'PM2.5', message: 'Elevated particle levels detected', time: '2 min ago' },
        { level: 'info', sensor: 'Network', message: 'Sensor SN-003 reconnected', time: '5 min ago' },
        { level: 'critical', sensor: 'Temperature', message: 'High temperature threshold exceeded', time: '8 min ago' }
    ];
    
    showModal('System Alerts', generateAlertsContent(alertsData));
    
    // Clear notification badge
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.style.display = 'none';
    }
}

function handleDataExport() {
    // Simulate data export
    showNotification('Preparing data export...', 'info');
    
    setTimeout(() => {
        const exportData = {
            timestamp: new Date().toISOString(),
            sensors: getSensorData(),
            format: 'JSON'
        };
        
        // Create downloadable file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `sensor-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('Data exported successfully!', 'success');
    }, 1000);
}

function showCalibrationModal() {
    const calibrationContent = `
        <div class="calibration-panel">
            <div class="calibration-section">
                <h4>Sensor Calibration</h4>
                <div class="calibration-controls">
                    <div class="control-group">
                        <label>PM2.5 Offset:</label>
                        <input type="number" value="0" step="0.1" id="pm25-offset">
                        <button class="btn-calibrate" onclick="calibrateSensor('pm25')">Calibrate</button>
                    </div>
                    <div class="control-group">
                        <label>Temperature Offset:</label>
                        <input type="number" value="0" step="0.1" id="temp-offset">
                        <button class="btn-calibrate" onclick="calibrateSensor('temperature')">Calibrate</button>
                    </div>
                    <div class="control-group">
                        <label>Humidity Offset:</label>
                        <input type="number" value="0" step="0.1" id="humidity-offset">
                        <button class="btn-calibrate" onclick="calibrateSensor('humidity')">Calibrate</button>
                    </div>
                </div>
            </div>
            <div class="calibration-status">
                <p>Last calibration: <span id="last-calibration">2024-09-20 14:30</span></p>
                <button class="btn-reset" onclick="resetCalibration()">Reset All</button>
            </div>
        </div>
    `;
    
    showModal('Sensor Calibration', calibrationContent);
}

function showSettingsModal() {
    const settingsContent = `
        <div class="settings-panel">
            <div class="settings-section">
                <h4>Display Settings</h4>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="auto-refresh" checked>
                        Auto-refresh data (30s)
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="show-animations" checked>
                        Enable animations
                    </label>
                </div>
                <div class="setting-item">
                    <label>Temperature Unit:</label>
                    <select id="temp-unit">
                        <option value="celsius">Celsius (°C)</option>
                        <option value="fahrenheit">Fahrenheit (°F)</option>
                    </select>
                </div>
            </div>
            <div class="settings-section">
                <h4>Alert Thresholds</h4>
                <div class="setting-item">
                    <label>PM2.5 Warning Level:</label>
                    <input type="number" value="25" id="pm25-threshold"> µg/m³
                </div>
                <div class="setting-item">
                    <label>Temperature Alert:</label>
                    <input type="number" value="35" id="temp-threshold"> °C
                </div>
            </div>
            <div class="settings-actions">
                <button class="btn-save" onclick="saveSettings()">Save Settings</button>
                <button class="btn-reset" onclick="resetSettings()">Reset to Default</button>
            </div>
        </div>
    `;
    
    showModal('Dashboard Settings', settingsContent);
}

function initializeGauges() {
    // Create all sensor gauge charts
    createGaugeChart('vocGauge', 0, 100, 0, '#9e9e9e'); // VOC: 0-100 ppb
    createGaugeChart('pm25Gauge', 0, 50, 1, '#4caf50'); // PM2.5: 0-50 µg/m³
    createGaugeChart('pm1Gauge', 0, 50, 1, '#4caf50'); // PM1: 0-50 µg/m³
    createGaugeChart('pm10Gauge', 0, 100, 1.5, '#4caf50'); // PM10: 0-100 µg/m³
    createGaugeChart('humidityGauge', 0, 100, 0, '#2196f3'); // Humidity: 0-100%
    createGaugeChart('temperatureGauge', -10, 40, 22.5, '#f44336'); // Temperature: -10-40°C
    createGaugeChart('windSpeedGauge', 0, 25, 0, '#9c27b0'); // Wind Speed: 0-25 m/s
    createGaugeChart('windDirectionGauge', 0, 360, 104, '#9c27b0'); // Wind Direction: 0-360°
    createGaugeChart('signalGauge', -100, 0, -83, '#ff5722'); // Signal: -100-0 dBm
}

function createGaugeChart(canvasId, minValue, maxValue, currentValue, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 20;
    const radius = 70;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 12;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();
    
    // Calculate current value angle
    const valueRange = maxValue - minValue;
    const valuePercentage = Math.max(0, Math.min(1, (currentValue - minValue) / valueRange));
    const currentAngle = startAngle + (Math.PI * valuePercentage);
    
    // Draw value arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
    ctx.lineWidth = 12;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw threshold markers
    drawThresholdMarkers(ctx, centerX, centerY, radius + 15, minValue, maxValue);
    
    // Animate the gauge
    animateGauge(canvas, minValue, maxValue, currentValue, color);
}

function drawThresholdMarkers(ctx, centerX, centerY, radius, minValue, maxValue) {
    const markers = [0, 0.25, 0.5, 0.75, 1];
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.font = '8px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    
    markers.forEach(marker => {
        const angle = Math.PI + (Math.PI * marker);
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + 8);
        const y2 = centerY + Math.sin(angle) * (radius + 8);
        
        // Draw marker line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Draw value labels
        if (marker === 0 || marker === 0.5 || marker === 1) {
            const value = minValue + (maxValue - minValue) * marker;
            const labelX = centerX + Math.cos(angle) * (radius + 20);
            const labelY = centerY + Math.sin(angle) * (radius + 20);
            ctx.fillText(Math.round(value), labelX, labelY + 3);
        }
    });
}

function animateGauge(canvas, minValue, maxValue, targetValue, color) {
    const ctx = canvas.getContext('2d');
    let currentAnimValue = minValue;
    const animationSpeed = (maxValue - minValue) / 60; // 60 frames
    
    function animate() {
        if (currentAnimValue < targetValue) {
            currentAnimValue += animationSpeed;
            
            // Redraw gauge
            const centerX = canvas.width / 2;
            const centerY = canvas.height - 20;
            const radius = 70;
            const startAngle = Math.PI;
            
            // Clear and redraw background
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Background arc
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, 2 * Math.PI);
            ctx.lineWidth = 12;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.stroke();
            
            // Animated value arc
            const valueRange = maxValue - minValue;
            const valuePercentage = Math.max(0, Math.min(1, (currentAnimValue - minValue) / valueRange));
            const currentAngle = startAngle + (Math.PI * valuePercentage);
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
            ctx.lineWidth = 12;
            ctx.strokeStyle = color;
            ctx.lineCap = 'round';
            ctx.stroke();
            
            // Redraw threshold markers
            drawThresholdMarkers(ctx, centerX, centerY, radius + 15, minValue, maxValue);
            
            requestAnimationFrame(animate);
        }
    }
    
    setTimeout(animate, 500);
}

function createLineChart() {
    const canvas = document.getElementById('lineChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    // Set canvas size to fill container
    const containerRect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = (containerRect.width - 40) * dpr; // Subtract padding
    canvas.height = (containerRect.height - 40) * dpr; // Subtract padding
    canvas.style.width = (containerRect.width - 40) + 'px';
    canvas.style.height = (containerRect.height - 40) + 'px';
    
    // Scale the drawing context for high DPI displays
    ctx.scale(dpr, dpr);
    
    const chartWidth = canvas.style.width.replace('px', '') - 100;
    const chartHeight = canvas.style.height.replace('px', '') - 80;
    const startX = 60;
    const startY = 40;
    
    // Sample data for sensor trends over time
    const sensorData = {
        temperature: [22.5, 23.1, 24.2, 25.0, 24.8, 23.9, 22.7, 21.8, 20.9, 21.5, 22.3, 23.8, 24.5, 25.2, 24.9],
        humidity: [45, 47, 52, 55, 58, 54, 49, 46, 43, 45, 48, 51, 56, 59, 57],
        pm25: [8, 12, 15, 18, 22, 19, 14, 10, 7, 9, 11, 16, 20, 23, 18],
        time: ['10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00', '12:20', '12:40', '13:00', '13:20', '13:40', '14:00', '14:20', '14:40']
    };
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    drawGrid(ctx, startX, startY, chartWidth, chartHeight);
    
    // Draw axes
    drawAxes(ctx, startX, startY, chartWidth, chartHeight, sensorData.time);
    
    // Draw lines for each sensor
    drawSensorLine(ctx, startX, startY, chartWidth, chartHeight, sensorData.temperature, '#f44336', 'Temperature', 20, 26);
    drawSensorLine(ctx, startX, startY, chartWidth, chartHeight, sensorData.humidity, '#2196f3', 'Humidity', 40, 65);
    drawSensorLine(ctx, startX, startY, chartWidth, chartHeight, sensorData.pm25, '#4caf50', 'PM2.5', 5, 25);
    
    // Draw legend
    drawLegend(ctx, chartWidth - 80, startY);
}

function drawGrid(ctx, startX, startY, width, height) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (8 lines for better resolution)
    for (let i = 0; i <= 8; i++) {
        const y = startY + (height / 8) * i;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + width, y);
        ctx.stroke();
    }
    
    // Vertical grid lines (15 lines to match data points)
    for (let i = 0; i <= 14; i++) {
        const x = startX + (width / 14) * i;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + height);
        ctx.stroke();
    }
}

function drawAxes(ctx, startX, startY, width, height, timeLabels) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(startX, startY + height);
    ctx.lineTo(startX + width, startY + height);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY + height);
    ctx.stroke();
    
    // Time labels (show every 3rd label to avoid crowding)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    
    timeLabels.forEach((label, index) => {
        if (index % 3 === 0 || index === timeLabels.length - 1) { // Show every 3rd label
            const x = startX + (width / (timeLabels.length - 1)) * index;
            ctx.fillText(label, x, startY + height + 20);
        }
    });
    
    // Y-axis labels
    const yLabels = ['Low', '', 'Medium', '', 'High'];
    ctx.textAlign = 'right';
    yLabels.forEach((label, index) => {
        if (label) {
            const y = startY + height - (height / (yLabels.length - 1)) * index;
            ctx.fillText(label, startX - 10, y + 4);
        }
    });
    
    // Chart title
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Real-time Sensor Data Monitoring', startX + width / 2, startY - 15);
}

function drawSensorLine(ctx, startX, startY, width, height, data, color, label, minVal, maxVal) {
    const range = maxVal - minVal;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = startX + (width / (data.length - 1)) * index;
        const normalizedValue = (value - minVal) / range;
        const y = startY + height - (normalizedValue * height);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = color;
    data.forEach((value, index) => {
        const x = startX + (width / (data.length - 1)) * index;
        const normalizedValue = (value - minVal) / range;
        const y = startY + height - (normalizedValue * height);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function drawLegend(ctx, x, y) {
    const legends = [
        { color: '#f44336', label: 'Temperature (°C)' },
        { color: '#2196f3', label: 'Humidity (%)' },
        { color: '#4caf50', label: 'PM2.5 (µg/m³)' }
    ];
    
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    legends.forEach((legend, index) => {
        const legendY = y + index * 25;
        
        // Draw color box
        ctx.fillStyle = legend.color;
        ctx.fillRect(x, legendY, 15, 15);
        
        // Draw label
        ctx.fillStyle = 'white';
        ctx.fillText(legend.label, x + 20, legendY + 12);
    });
}

function addInteractivity() {
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.metric-card, .funnel-bar, .metric-section');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Add click animation to sidebar metrics
    const metricItems = document.querySelectorAll('.metric-item');
    
    metricItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            setTimeout(() => {
                this.style.backgroundColor = 'transparent';
            }, 200);
        });
    });
    
    // Add funnel bar progress animation
    animateFunnelBars();
    
    // Simulate data updates
    setInterval(updateRandomMetric, 5000);
}

function animateFunnelBars() {
    const funnelBars = document.querySelectorAll('.funnel-bar');
    
    funnelBars.forEach((bar, index) => {
        const progressBar = bar.querySelector('.bar-progress');
        if (progressBar) {
            // Start with 0 width
            progressBar.style.width = '0%';
            
            // Animate to target width after delay
            setTimeout(() => {
                const targetWidth = progressBar.style.width || '0%';
                if (bar.classList.contains('discovery')) progressBar.style.width = '90%';
                else if (bar.classList.contains('demos')) progressBar.style.width = '85%';
                else if (bar.classList.contains('proposals')) progressBar.style.width = '75%';
                else if (bar.classList.contains('negotiations')) progressBar.style.width = '45%';
                else if (bar.classList.contains('final')) progressBar.style.width = '95%';
                else if (bar.classList.contains('closed')) progressBar.style.width = '0%';
            }, (index + 1) * 300);
        }
    });
}

function animateNumbers() {
    // Animate number counting for various number elements
    const numberElements = document.querySelectorAll('.card-number, .metric-large, .value, .bar-amount');
    
    numberElements.forEach(element => {
        const text = element.textContent;
        const finalValue = parseFloat(text.replace(/[^0-9.-]/g, ''));
        if (isNaN(finalValue)) return;
        
        let currentValue = 0;
        const increment = finalValue / 60; // Animate over 1 second (60fps)
        const prefix = text.match(/^\D*/)[0]; // Get prefix (like $)
        const suffix = text.replace(/^[^a-zA-Z]*/, '').replace(/[0-9.-]/g, ''); // Get suffix (like k)
        
        function updateNumber() {
            if (currentValue < finalValue) {
                currentValue += increment;
                const displayValue = Math.floor(currentValue);
                element.textContent = prefix + displayValue + suffix;
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = text; // Restore original text
            }
        }
        
        // Start animation after a delay based on element position
        const delay = Math.random() * 800 + 200;
        setTimeout(updateNumber, delay);
    });
}

function updateRandomMetric() {
    // Simulate real-time data updates
    const metricValues = document.querySelectorAll('.value');
    if (metricValues.length === 0) return;
    
    const randomMetric = metricValues[Math.floor(Math.random() * metricValues.length)];
    const currentValue = parseFloat(randomMetric.textContent.replace(/[^0-9.-]/g, ''));
    
    if (!isNaN(currentValue)) {
        const change = (Math.random() - 0.5) * 0.1; // ±5% change
        const newValue = Math.max(0, currentValue * (1 + change));
        const suffix = randomMetric.textContent.replace(/[0-9.-]/g, '');
        
        // Animate to new value
        animateValueChange(randomMetric, currentValue, newValue, suffix);
        
        // Update corresponding change indicator
        const changeElement = randomMetric.parentElement.querySelector('.change');
        if (changeElement) {
            const changePercent = ((newValue - currentValue) / currentValue * 100).toFixed(1);
            const isPositive = changePercent >= 0;
            
            changeElement.textContent = (isPositive ? '▲ ' : '▼ ') + Math.abs(changePercent) + '%';
            changeElement.className = 'change ' + (isPositive ? 'positive' : 'negative');
        }
    }
}

function animateValueChange(element, startValue, endValue, suffix) {
    const duration = 1000; // 1 second
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeOut;
        
        if (suffix.includes('$')) {
            element.textContent = '$' + Math.floor(currentValue);
        } else if (suffix.includes('d') || suffix.includes('h')) {
            // Handle time format
            element.textContent = Math.floor(currentValue) + suffix.replace(/[0-9]/g, '');
        } else {
            element.textContent = currentValue.toFixed(1).replace('.0', '') + suffix.replace(/[0-9.-]/g, '');
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Add ripple effect to clickable elements
function addRippleEffect() {
    const clickableElements = document.querySelectorAll('.metric-card, .funnel-bar, .metric-section, .metric-item');
    
    clickableElements.forEach(element => {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add pulse animation to key metrics
function addPulseAnimation() {
    const keyMetrics = document.querySelectorAll('.metric-large, .card-number');
    
    keyMetrics.forEach((metric, index) => {
        setTimeout(() => {
            metric.style.animation = 'pulse 2s infinite';
        }, index * 200);
    });
}

// Add pulse keyframes
const pulseStyle = document.createElement('style');
pulseStyle.textContent += `
    @keyframes pulse {
        0%, 100% { 
            transform: scale(1); 
        }
        50% { 
            transform: scale(1.05); 
        }
    }
`;
document.head.appendChild(pulseStyle);

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .metric-card, .funnel-bar, .metric-section, .metric-item {
        position: relative;
        overflow: hidden;
        cursor: pointer;
    }
    
    .ripple {
        position: absolute;
        background: rgba(255, 255, 255, 0.3);
        pointer-events: none;
        animation: ripple-animation 0.6s linear;
    }
    
    @keyframes ripple-animation {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize ripple effect and pulse animation
addRippleEffect();
addPulseAnimation();

// Responsive chart resize
window.addEventListener('resize', function() {
    setTimeout(() => {
        const canvas = document.getElementById('lineChart');
        if (canvas) {
            createLineChart();
        }
    }, 100);
});

// Add loading animation
function showLoadingAnimation() {
    const dashboard = document.querySelector('.dashboard-container');
    dashboard.style.opacity = '0';
    dashboard.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        dashboard.style.transition = 'all 0.8s ease';
        dashboard.style.opacity = '1';
        dashboard.style.transform = 'translateY(0)';
    }, 100);
}

// Initialize loading animation
showLoadingAnimation();

// Modal and Notification Utilities
function showModal(title, content) {
    // Remove existing modal
    const existingModal = document.querySelector('.dashboard-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'dashboard-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal() {
    const modal = document.querySelector('.dashboard-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function generateAlertsContent(alerts) {
    return `
        <div class="alerts-list">
            ${alerts.map(alert => `
                <div class="alert-item ${alert.level}">
                    <div class="alert-icon">
                        <i class="fas ${getAlertIcon(alert.level)}"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-sensor">${alert.sensor}</div>
                        <div class="alert-message">${alert.message}</div>
                        <div class="alert-time">${alert.time}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function getAlertIcon(level) {
    const icons = {
        critical: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[level] || icons.info;
}

function getSensorData() {
    // Collect current sensor data for export
    return {
        timestamp: new Date().toISOString(),
        voc: { value: 0, unit: 'ppb' },
        pm25: { value: 1, unit: 'µg/m³' },
        pm1: { value: 1, unit: 'µg/m³' },
        pm10: { value: 1.5, unit: 'µg/m³' },
        humidity: { value: 0, unit: '%' },
        temperature: { value: 22.5, unit: '°C' },
        windSpeed: { value: 0, unit: 'm/s' },
        windDirection: { value: 104, unit: '°' },
        signalStrength: { value: -83, unit: 'dBm' }
    };
}

function startLiveDataUpdates() {
    // Start real-time data simulation
    window.liveDataInterval = setInterval(() => {
        // Simulate slight data variations
        updateSensorValues();
        showNotification('Data updated', 'info');
    }, 2000);
}

function stopLiveDataUpdates() {
    if (window.liveDataInterval) {
        clearInterval(window.liveDataInterval);
        window.liveDataInterval = null;
    }
}

function updateSensorValues() {
    // Simulate small random changes in sensor values
    const sensors = ['vocGauge', 'pm25Gauge', 'humidityGauge', 'temperatureGauge'];
    
    sensors.forEach(sensorId => {
        const canvas = document.getElementById(sensorId);
        if (canvas) {
            // Add small random variation to simulate real sensor data
            const variation = (Math.random() - 0.5) * 0.1;
            // Re-render gauge with slight variation (implementation depends on your gauge function)
        }
    });
}

// Global functions for modal interactions
window.closeModal = closeModal;
window.calibrateSensor = function(sensorType) {
    showNotification(`${sensorType} sensor calibrated successfully!`, 'success');
};

window.resetCalibration = function() {
    showNotification('All sensors reset to factory calibration', 'info');
};

window.saveSettings = function() {
    showNotification('Settings saved successfully!', 'success');
    closeModal();
};

window.resetSettings = function() {
    showNotification('Settings reset to default values', 'info');
};

// Add this function to create the usage gauge
function createUsageGauge() {
    const canvas = document.getElementById('usageGauge');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 45;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Usage percentage (1.32 GB out of 100 GB = 1.32%)
    const usagePercent = 1.32;
    const maxPercent = 100;
    const angle = (usagePercent / maxPercent) * Math.PI; // Half circle
    
    // Draw background arc (gray)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();
    
    // Draw usage arc (blue)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + angle, false);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#2196f3';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw usage indicator marks
    drawGaugeMarks(ctx, centerX, centerY, radius);
}

function drawGaugeMarks(ctx, centerX, centerY, radius) {
    const markRadius = radius + 15;
    const marks = [0, 25, 50, 75, 100];
    
    marks.forEach(mark => {
        const angle = Math.PI + (mark / 100) * Math.PI;
        const x1 = centerX + (radius + 5) * Math.cos(angle);
        const y1 = centerY + (radius + 5) * Math.sin(angle);
        const x2 = centerX + (radius + 10) * Math.cos(angle);
        const y2 = centerY + (radius + 10) * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();
    });
}

/* filepath: d:\UI\Firmware\sensor-dashboard.js */
// Function to create colorful sensor gauges
function createSensorGauges() {
    const sensorCards = document.querySelectorAll('.sensor-gauge-card');
    
    sensorCards.forEach(card => {
        const canvas = card.querySelector('.sensor-gauge');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const value = parseFloat(canvas.dataset.value);
        const maxValue = parseFloat(canvas.dataset.max) || 100;
        const minValue = parseFloat(canvas.dataset.min) || 0;
        const unit = canvas.dataset.unit || '';
        
        // Get card color from CSS custom property
        const cardColor = getComputedStyle(card).getPropertyValue('--card-color').trim();
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height - 10;
        const radius = 35;
        
        // Calculate percentage
        let percentage;
        if (minValue < 0) {
            // Handle negative values (like temperature)
            percentage = (value - minValue) / (maxValue - minValue);
        } else {
            percentage = Math.abs(value) / maxValue;
        }
        
        // Ensure percentage is between 0 and 1
        percentage = Math.max(0, Math.min(1, percentage));
        
        const angle = percentage * Math.PI; // Semi-circle
        
        // Draw background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
        ctx.lineWidth = 8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
        
        // Create gradient for the gauge
        const gradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
        gradient.addColorStop(0, cardColor);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
        
        // Draw value arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + angle, false);
        ctx.lineWidth = 8;
        ctx.strokeStyle = gradient;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw gauge markers
        drawGaugeMarkers(ctx, centerX, centerY, radius);
        
        // Add glow effect
        ctx.shadowColor = cardColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + angle, false);
        ctx.lineWidth = 8;
        ctx.strokeStyle = cardColor;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.shadowBlur = 0;
    });
}

function drawGaugeMarkers(ctx, centerX, centerY, radius) {
    const markers = [0, 0.25, 0.5, 0.75, 1];
    
    markers.forEach(marker => {
        const angle = Math.PI + (marker * Math.PI);
        const x1 = centerX + (radius + 3) * Math.cos(angle);
        const y1 = centerY + (radius + 3) * Math.sin(angle);
        const x2 = centerX + (radius + 8) * Math.cos(angle);
        const y2 = centerY + (radius + 8) * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();
    });
}

// Add animation to gauge creation
function animateGauges() {
    const cards = document.querySelectorAll('.sensor-gauge-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Create gauges after animation starts
    setTimeout(() => {
        createSensorGauges();
    }, 300);
}

