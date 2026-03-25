let lineChart, speedChart, metricsChart;

function runSimulation() {
    const scenario = {
        traffic_period: document.getElementById("traffic_period").value,
        direction: document.getElementById("direction").value,
        time_scale: document.getElementById("time_scale").value
    };

    fetch("http://127.0.0.1:5000/run-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario),
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) { alert(data.error); return; }

        // Update Text Cards
        document.getElementById('vol-text').innerHTML = data.vehicle_volume.toLocaleString();
        document.getElementById('cong-text').innerHTML = data.congestion_index.toFixed(2);
        document.getElementById('conclusion-text').innerText = data.conclusion;
        document.getElementById('route-text').innerHTML = data.recommended_route;

        updateMetrics(data.results);
        updateVisuals(data.chart_data, data.results);
    })
    .catch(err => console.error("Fetch error:", err));
}

function updateMetrics(results) {
    const metricsDiv = document.getElementById('model-metrics');
    let html = '';
    const colors = { 'GRU': '#3498db', 'LSTM': '#2ecc71', 'Simple RNN': '#e74c3c' };
    
    for (let model in results) {
        const res = results[model];
        html += `
            <div class="metric-item">
                <div class="metric-value" style="color: ${colors[model]}">${res.predicted_speed} <small>km/h</small></div>
                <div class="metric-label">${model}</div>
                <div class="metric-sub">MAE: ${res.mae} | MSE: ${res.mse} | RMSE: ${res.rmse}</div>
            </div>`;
    }
    metricsDiv.innerHTML = html;
}

function updateVisuals(timeData, results) {
    const modelNames = Object.keys(results);
    
    // Safety: Destroy old charts before drawing new ones
    if (lineChart) lineChart.destroy();
    if (speedChart) speedChart.destroy();
    if (metricsChart) metricsChart.destroy();

    // 1. Line Chart
    lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: timeData.labels,
            datasets: [{ label: 'Traffic Speed', data: timeData.actual, borderColor: '#3498db', fill: true, backgroundColor: 'rgba(52, 152, 219, 0.1)', tension: 0.3 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. Speed Chart
    speedChart = new Chart(document.getElementById('speedChart'), {
        type: 'bar',
        data: {
            labels: modelNames,
            datasets: [{
                label: 'Speed (km/h)',
                data: modelNames.map(m => results[m].predicted_speed),
                backgroundColor: ['#3498db', '#2ecc71', '#e74c3c']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // 3. Combined Metrics Chart (Grouped)
    metricsChart = new Chart(document.getElementById('metricsChart'), {
        type: 'bar',
        data: {
            labels: modelNames,
            datasets: [
                { label: 'MAE', data: modelNames.map(m => results[m].mae), backgroundColor: '#f1c40f' },
                { label: 'MSE', data: modelNames.map(m => results[m].mse), backgroundColor: '#9b59b6' },
                { label: 'RMSE', data: modelNames.map(m => results[m].rmse), backgroundColor: '#34495e' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

window.onload = () => setTimeout(runSimulation, 500);