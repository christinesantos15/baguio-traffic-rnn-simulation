let lineChart, barChart;

function runSimulation() {
    const scenario = {
    traffic_period: document.getElementById("traffic_period").value,
    direction: document.getElementById("direction").value,
    time_scale: document.getElementById("time_scale").value // Ensure this ID matches your HTML <select>
};

    fetch("http://127.0.0.1:5000/run-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario),
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) return alert(data.error);

        // Update Text Cards
        document.getElementById('vol-text').innerText = data.vehicle_volume.toLocaleString();
        document.getElementById('conclusion-text').innerText = data.conclusion;
        document.getElementById('route-text').innerText = data.recommended_route;

        const tbody = document.getElementById("output");
        tbody.innerHTML = "";
        
        const names = [], speeds = [], rmse = [];
        for (let m in data.results) {
            const res = data.results[m];
            names.push(m);
            speeds.push(res.predicted_speed);
            rmse.push(res.rmse);
            
            if (m === "Simple RNN") {
                document.getElementById('cong-text').innerText = res.compute_index.toFixed(2);
            }

            tbody.innerHTML += `<tr><td><b>${m}</b></td><td>${res.predicted_speed} km/h</td><td>${res.mae}</td><td>${res.mse}</td><td>${res.rmse}</td></tr>`;
        }
        updateVisuals(data.chart_data, names, speeds, rmse);
    });
}

function updateVisuals(timeData, names, speeds, rmseValues) {
    const ctxL = document.getElementById('lineChart').getContext('2d');
    const ctxB = document.getElementById('barChart').getContext('2d');

    if (lineChart) lineChart.destroy();
    lineChart = new Chart(ctxL, {
        type: 'line',
        data: {
            labels: timeData.labels,
            datasets: [{ label: 'Speed (km/h)', data: timeData.actual, borderColor: '#3498db', tension: 0.3, fill: false }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    if (barChart) barChart.destroy();
    barChart = new Chart(ctxB, {
        type: 'bar',
        data: {
            labels: names,
            datasets: [
                { label: 'Predicted Speed', data: speeds, backgroundColor: '#3498db' },
                { label: 'RMSE', data: rmseValues, backgroundColor: '#e74c3c' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}