let lineChart, speedChart, metricsChart;

/**
 * Logic to sync the Congestion Index with the Physical Traffic State Table
 */
function getTrafficSync(index) {
    if (index <= 2.9) {
        return { state: "Free Flow", color: "#2ecc71", label: "Clear", info: "High Space Availability" };
    } else if (index <= 5.9) {
        return { state: "Stable Flow", color: "#f1c40f", label: "Moderate", info: "Moderate Space" };
    } else if (index <= 7.9) {
        return { state: "Heavy Traffic", color: "#e67e22", label: "Heavy", info: "Limited Space" };
    } else {
        return { state: "Oversaturated", color: "#e74c3c", label: "Severe", info: "Zero Space (Gridlock)" };
    }
}

async function runSimulation() {
    const scenario = {
        traffic_period: document.getElementById("traffic_period").value,
        direction: document.getElementById("direction").value,
        time_scale: document.getElementById("time_scale").value
    };

    try {
        const response = await fetch("http://127.0.0.1:5000/run-simulation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scenario),
        });
        const data = await response.json();

        if (data.error) { alert(data.error); return; }

        // --- 1. SYNC CONGESTION & VOLUME DATA ---
        const traffic = getTrafficSync(data.congestion_index);
        
        // Update Congestion Card
        const congVal = document.getElementById('cong-text');
        congVal.innerText = data.congestion_index.toFixed(2);
        congVal.style.color = traffic.color;
        
        const congLab = document.getElementById('cong-label');
        congLab.innerText = `${traffic.label}: ${traffic.state}`;
        congLab.style.color = traffic.color;
        
        document.getElementById('congestion-card').style.borderLeftColor = traffic.color;

        // Update Volume Card
        const volText = document.getElementById('vol-text');
        volText.innerText = data.vehicle_volume.toLocaleString();
        volText.style.color = traffic.color;

        // Update Text Results
        document.getElementById('route-text').innerText = data.recommended_route;
        document.getElementById('conclusion-text').innerText = `${traffic.info}. ${data.conclusion}`;

        // Update Optimal Model
        const bestModel = Object.keys(data.results).reduce((a, b) => 
            data.results[a].rmse < data.results[b].rmse ? a : b);
        document.getElementById('optimal-model-text').innerText = bestModel;

        // --- 2. REFRESH CHARTS ---
        updateVisuals(data.chart_data, data.results);
        updateMetrics(data.results);

    } catch (err) {
        console.error("Fetch error:", err);
    }
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
                <div class="metric-sub" style="font-size:0.7rem; color:#888;">MAE: ${res.mae} | RMSE: ${res.rmse}</div>
            </div>`;
    }
    metricsDiv.innerHTML = html;
}

function updateVisuals(timeData, results) {
    const modelNames = Object.keys(results);
    const colors = ['#3498db', '#2ecc71', '#e74c3c'];

    if (lineChart) lineChart.destroy();
    if (speedChart) speedChart.destroy();
    if (metricsChart) metricsChart.destroy();

    lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: timeData.labels,
            datasets: [{ label: 'Speed Trend', data: timeData.actual, borderColor: '#3498db', fill: true, backgroundColor: 'rgba(52, 152, 219, 0.1)', tension: 0.3 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    speedChart = new Chart(document.getElementById('speedChart'), {
        type: 'bar',
        data: {
            labels: modelNames,
            datasets: [{ label: 'Predicted Speed', data: modelNames.map(m => results[m].predicted_speed), backgroundColor: colors }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    metricsChart = new Chart(document.getElementById('metricsChart'), {
        type: 'bar',
        data: {
            labels: modelNames,
            datasets: [
                { label: 'MAE', data: modelNames.map(m => results[m].mae), backgroundColor: '#f1c40f' },
                { label: 'RMSE', data: modelNames.map(m => results[m].rmse), backgroundColor: '#34495e' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

window.onload = () => setTimeout(runSimulation, 500);