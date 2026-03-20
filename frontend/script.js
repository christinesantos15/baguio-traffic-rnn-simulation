let lineChart, speedChart, accuracyChart;

function runSimulation() {
    const scenario = {
        traffic_period: document.getElementById("traffic_period").value,
        direction: document.getElementById("direction").value,
        time_scale: document.getElementById("time_scale").value
    };

    // Show loading state
    document.getElementById('vol-text').innerHTML = 'Loading...';
    document.getElementById('cong-text').innerHTML = '...';
    
    fetch("http://127.0.0.1:5000/run-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario),
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }

        // Update Text Cards
        document.getElementById('vol-text').innerHTML = data.vehicle_volume.toLocaleString();
        document.getElementById('conclusion-text').innerText = data.conclusion;
        document.getElementById('route-text').innerHTML = data.recommended_route;
        
        // Update congestion index with color coding
        const congValue = data.congestion_index;
        document.getElementById('cong-text').innerHTML = congValue.toFixed(2);
        
        let congestionLabel = '';
        let badgeClass = '';
        if (congValue < 5) {
            congestionLabel = 'Light Traffic';
            badgeClass = 'badge-light';
        } else if (congValue < 10) {
            congestionLabel = 'Moderate Traffic';
            badgeClass = 'badge-moderate';
        } else if (congValue < 15) {
            congestionLabel = 'Heavy Traffic';
            badgeClass = 'badge-heavy';
        } else {
            congestionLabel = 'Severe Congestion';
            badgeClass = 'badge-heavy';
        }
        document.getElementById('cong-label').innerHTML = 
            `<span class="congestion-badge ${badgeClass}">${congestionLabel}</span>`;
        
        // Find optimal model (lowest RMSE)
        let optimalModel = "Simple RNN";
        let lowestRMSE = Infinity;
        let optimalRMSE = 0;
        
        for (let model in data.results) {
            if (data.results[model].rmse < lowestRMSE) {
                lowestRMSE = data.results[model].rmse;
                optimalModel = model;
                optimalRMSE = data.results[model].rmse;
            }
        }
        document.getElementById('optimal-model-text').innerHTML = 
            `${optimalModel}<br><small style="font-size:0.8rem;">RMSE: ${optimalRMSE}</small>`;

        // Update metrics display
        updateMetrics(data.results);
        
        // Update charts
        updateVisuals(data.chart_data, data.results);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to connect to server. Make sure Flask is running on port 5000.');
    });
}

function updateMetrics(results) {
    const metricsDiv = document.getElementById('model-metrics');
    let html = '';
    
    // Define colors for each model
    const colors = {
        'Simple RNN': '#3498db',
        'LSTM': '#2ecc71',
        'GRU': '#e74c3c'
    };
    
    for (let model in results) {
        const res = results[model];
        html += `
            <div class="metric-item">
                <div class="metric-value" style="color: ${colors[model]}">${res.predicted_speed} <small style="font-size:0.9rem;">km/h</small></div>
                <div class="metric-label">${model}</div>
                <div class="metric-sub">RMSE: ${res.rmse}</div>
            </div>
        `;
    }
    
    metricsDiv.innerHTML = html;
}

function updateVisuals(timeData, results) {
    const ctxL = document.getElementById('lineChart').getContext('2d');
    const ctxS = document.getElementById('speedChart').getContext('2d');
    const ctxA = document.getElementById('accuracyChart').getContext('2d');

    const modelNames = Object.keys(results);
    const speeds = modelNames.map(m => results[m].predicted_speed);
    const rmseValues = modelNames.map(m => results[m].rmse);
    
    // Colors for consistency
    const colors = ['#3498db', '#2ecc71', '#e74c3c'];

    // Line Chart - Traffic Speed Trend
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(ctxL, {
        type: 'line',
        data: {
            labels: timeData.labels,
            datasets: [{
                label: 'Traffic Speed (km/h)',
                data: timeData.actual,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#3498db',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    display: true,
                    position: 'top',
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Hour:Minute)',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Speed (km/h)',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });

    // Speed Comparison Chart - Bar Chart
    if (speedChart) speedChart.destroy();
    speedChart = new Chart(ctxS, {
        type: 'bar',
        data: {
            labels: modelNames,
            datasets: [{
                label: 'Predicted Speed (km/h)',
                data: speeds,
                backgroundColor: colors.map(c => c + 'CC'), // Add transparency
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 5,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Speed: ${context.raw} km/h`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'RNN Models',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Speed (km/h)',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });

    // Accuracy (RMSE) Comparison Chart - Bar Chart
    if (accuracyChart) accuracyChart.destroy();
    accuracyChart = new Chart(ctxA, {
        type: 'bar',
        data: {
            labels: modelNames,
            datasets: [{
                label: 'RMSE (Lower is Better)',
                data: rmseValues,
                backgroundColor: colors.map(c => c + '99'), // More transparency
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 5,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `RMSE: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'RNN Models',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'RMSE Value',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });
}

// Run simulation on page load with default values
window.onload = function() {
    setTimeout(runSimulation, 500); // Small delay to ensure everything loads
};