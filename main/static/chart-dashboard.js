 // Global variables for chart management
        let currentChart = null;
        let currentSensorData = {};

        // Sample data generator for different sensors
        function generateSensorData(sensorType, hours = 24) {
            const data = [];
            const labels = [];
            const now = new Date();

            // Generate data points for the specified time range
            const interval = hours * 60 / 144; // 144 data points for smooth curve

            for (let i = 144; i >= 0; i--) {
                const time = new Date(now.getTime() - (i * interval * 60 * 1000));
                labels.push(time);

                // Generate realistic data based on sensor type
                let value;
                const timeOfDay = time.getHours();
                const dayProgress = timeOfDay / 24;

                switch (sensorType) {
                    case 'temperature':
                        // Temperature varies throughout the day
                        const basTemp = 25;
                        const tempVariation = 5 * Math.sin(dayProgress * Math.PI * 2) + Math.random() * 2 - 1;
                        value = basTemp + tempVariation;
                        break;
                    case 'humidity':
                        // Humidity typically higher at night
                        const baseHum = 65;
                        const humVariation = -10 * Math.sin(dayProgress * Math.PI * 2) + Math.random() * 5 - 2.5;
                        value = Math.max(30, Math.min(90, baseHum + humVariation));
                        break;
                    case 'pm25':
                        // PM2.5 with some pollution spikes
                        const basePM25 = 8;
                        const spike = Math.random() < 0.1 ? Math.random() * 15 : 0;
                        value = basePM25 + Math.random() * 5 + spike;
                        break;
                    case 'pm10':
                        // PM10 usually higher than PM2.5
                        const basePM10 = 15;
                        const pm10Spike = Math.random() < 0.1 ? Math.random() * 20 : 0;
                        value = basePM10 + Math.random() * 8 + pm10Spike;
                        break;
                    case 'aqi':
                        // AQI calculation based on time and random factors
                        const baseAQI = 42;
                        value = baseAQI + Math.random() * 20 - 10;
                        break;
                    case 'voc':
                        // VOC with occasional spikes
                        const baseVOC = 0.2;
                        value = baseVOC + Math.random() * 0.5;
                        break;
                    case 'windspeed':
                        // Wind speed varies throughout day
                        const baseWind = 2.3;
                        value = baseWind + Math.random() * 3 - 1.5;
                        value = Math.max(0, value);
                        break;
                    case 'pressure':
                        // Atmospheric pressure with gradual changes
                        const basePressure = 1013;
                        value = basePressure + Math.sin(dayProgress * Math.PI * 4) * 5 + Math.random() * 2 - 1;
                        break;
                    default:
                        value = Math.random() * 100;
                }

                data.push(Math.round(value * 10) / 10);
            }

            return { labels, data };
        }

        // Function to create and display sensor chart
        function showSensorChart(sensorType, sensorName, unit, color) {
            const sensorData = generateSensorData(sensorType);
            currentSensorData = sensorData;

            // Update sensor detail header
            document.getElementById('sensor-detail-title').textContent = sensorName + ' Sensor';
            document.getElementById('current-value').textContent = sensorData.data[sensorData.data.length - 1];
            document.getElementById('current-unit').textContent = unit;

            // Calculate statistics
            const values = sensorData.data;
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;

            document.getElementById('min-value').textContent = minValue.toFixed(1) + ' ' + unit;
            document.getElementById('max-value').textContent = maxValue.toFixed(1) + ' ' + unit;
            document.getElementById('avg-value').textContent = avgValue.toFixed(1) + ' ' + unit;

            // Update additional info
            document.getElementById('sensor-id').textContent = sensorType.toUpperCase() + '-001';
            document.getElementById('data-points').textContent = sensorData.data.length;

            // Destroy existing chart
            if (currentChart) {
                currentChart.destroy();
            }

            // Create new chart
            const ctx = document.getElementById('sensorChart').getContext('2d');
            currentChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sensorData.labels,
                    datasets: [{
                        label: sensorName,
                        data: sensorData.data,
                        borderColor: color,
                        backgroundColor: color + '20',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: color,
                        pointHoverBorderColor: '#ffffff',
                        pointHoverBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: color,
                            borderWidth: 1,
                            displayColors: false,
                            callbacks: {
                                title: function (context) {
                                    const date = new Date(context[0].parsed.x);
                                    return date.toLocaleString();
                                },
                                label: function (context) {
                                    return `${sensorName}: ${context.parsed.y.toFixed(1)} ${unit}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                displayFormats: {
                                    hour: 'HH:mm',
                                    day: 'MMM DD'
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                maxTicksLimit: 12
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                callback: function (value) {
                                    return value.toFixed(1) + ' ' + unit;
                                }
                            }
                        }
                    }
                }
            });

            // Show sensor detail view
            document.getElementById('sensors-tab').style.display = 'none';
            document.getElementById('sensor-detail-view').style.display = 'block';
        }

        // Tab switching functionality
        document.addEventListener('DOMContentLoaded', function () {
            const tabs = document.querySelectorAll('.nav-tab');
            const tabContents = document.querySelectorAll('.tab-content');
            const sidebarItems = document.querySelectorAll('.sidebar-item');
            const settingsPanels = document.querySelectorAll('.settings-panel');

            // Tab switching function
            function switchTab(tabName) {
                // Remove active class from all tabs and content
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));

                // Hide all special views
                document.getElementById('sensor-detail-view').style.display = 'none';
                document.getElementById('connection-settings-view').style.display = 'none';

                // Add active class to current tab and corresponding content
                const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
                const activeContent = document.getElementById(`${tabName}-tab`);

                if (activeTab && activeContent) {
                    activeTab.classList.add('active');
                    activeContent.classList.add('active');
                }
            }

            // Tab click handlers
            tabs.forEach(tab => {
                tab.addEventListener('click', function () {
                    const tabName = this.getAttribute('data-tab');
                    switchTab(tabName);
                    console.log('Switched to tab:', tabName);
                });
            });

            // Sensor card click handlers
            const sensorCards = document.querySelectorAll('.sensor-card');
            sensorCards.forEach(card => {
                card.addEventListener('click', function () {
                    const sensorType = this.getAttribute('data-sensor');
                    const sensorName = this.getAttribute('data-sensor-name');
                    const unit = this.getAttribute('data-unit');
                    const color = this.getAttribute('data-color');

                    showSensorChart(sensorType, sensorName, unit, color);
                });
            });

            // Back to sensors button
            const backToSensorsBtn = document.querySelector('[data-action="back-to-sensors"]');
            if (backToSensorsBtn) {
                backToSensorsBtn.addEventListener('click', function () {
                    document.getElementById('sensor-detail-view').style.display = 'none';
                    document.getElementById('sensors-tab').style.display = 'block';
                });
            }

            // Time range buttons
            const timeBtns = document.querySelectorAll('.time-btn');
            timeBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    timeBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    const range = this.getAttribute('data-range');
                    console.log('Switched to time range:', range);
                    // Here you would typically reload the chart with new data
                });
            });

            // Connection Settings navigation
            const connectionSettingsBtn = document.querySelector('[data-action="connection-settings"]');
            const backBtn = document.querySelector('[data-action="back-to-network"]');
            const networkTab = document.getElementById('network-tab');
            const connectionSettingsView = document.getElementById('connection-settings-view');

            if (connectionSettingsBtn) {
                connectionSettingsBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    // Hide all tab contents
                    tabContents.forEach(tc => tc.classList.remove('active'));
                    // Show connection settings
                    connectionSettingsView.style.display = 'block';
                });
            }

            if (backBtn) {
                backBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    connectionSettingsView.style.display = 'none';
                    // Switch back to network tab
                    switchTab('network');
                });
            }

            // Sidebar menu switching
            sidebarItems.forEach(item => {
                item.addEventListener('click', function () {
                    // Remove active class from all items
                    sidebarItems.forEach(i => i.classList.remove('active'));
                    settingsPanels.forEach(p => p.classList.remove('active'));

                    // Add active class to clicked item
                    this.classList.add('active');

                    // Show corresponding panel
                    const settingType = this.getAttribute('data-setting');
                    const panel = document.getElementById(settingType + '-panel');
                    if (panel) {
                        panel.classList.add('active');
                    }
                });
            });

            // Toggle functionality
            const toggleBtn = document.querySelector('.toggle-btn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', function () {
                    this.classList.toggle('active');
                    this.textContent = this.classList.contains('active') ? 'ON' : 'OFF';
                });
            }

            // Apply button functionality
            const applyBtns = document.querySelectorAll('.apply-btn');
            applyBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    // Show success feedback
                    this.textContent = 'Applied!';
                    this.style.background = '#4ade80';
                    setTimeout(() => {
                        this.textContent = 'Apply';
                        this.style.background = '';
                    }, 2000);
                });
            });

            // Quick setting buttons
            const quickBtns = document.querySelectorAll('.quick-btn');
            quickBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    this.textContent = 'Done!';
                    this.style.background = '#4ade80';
                    setTimeout(() => {
                        this.textContent = this.getAttribute('data-original-text') || 'Configure';
                        this.style.background = '';
                    }, 2000);
                });
            });

            // Simulate real-time updates for sensors
            function updateSensorValues() {
                // Update network stats
                const uploadStat = document.querySelector('.connection-stats .stat-item:first-child span');
                const downloadStat = document.querySelector('.connection-stats .stat-item:last-child span');

                if (uploadStat && downloadStat) {
                    uploadStat.textContent = Math.floor(Math.random() * 1000) + 'b/s';
                    downloadStat.textContent = Math.floor(Math.random() * 5000) + 'b/s';
                }

                const timestamp = document.querySelector('.timestamp');
                if (timestamp) {
                    const now = new Date();
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    timestamp.textContent = `00:${minutes}:${seconds}`;
                }

                // Update sensor values (for Sensors tab)
                const sensorValues = document.querySelectorAll('.sensor-card .value-large');
                sensorValues.forEach(value => {
                    const currentValue = parseFloat(value.textContent);
                    const variation = (Math.random() - 0.5) * 2; // -1 to +1
                    const newValue = Math.max(0, currentValue + variation);

                    if (value.textContent.includes('.')) {
                        value.textContent = newValue.toFixed(1);
                    } else {
                        value.textContent = Math.round(newValue);
                    }
                });
            }

            // Update every 5 seconds
            setInterval(updateSensorValues, 5000);
        });