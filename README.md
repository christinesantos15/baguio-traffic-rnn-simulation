# Baguio Traffic Flow Analysis

**Baguio Traffic** is a deep-learning powered simulation system designed to analyze and predict urban traffic congestion within the unique topography of Baguio City. Developed as a final-year thesis project, it compares various **Recurrent Neural Network (RNN)** architectures to provide data-driven insights for urban planning and route optimization.

---

## Core Features

### 📊 Simulation Dashboard

The central hub for traffic analysis. It allows users to set specific parameters and visualize real-time predictions.

* **Dynamic Inputs:** Adjust Analysis Scale (Daily/Monthly), Traffic Periods (e.g., Peak Hours), and Road Directions.
* **Live Metrics:** Tracks Predicted Speed, Traffic Speed Trends, and Model Error Comparisons side-by-side.


---

### 🚦 Congestion Index & Volume Tracking

The system translates complex neural network outputs into easy-to-read congestion metrics.

* **Weighted Index:** A 0.0 to 10.0 scale mapping traffic density from "Clear" to "Severe."
* **Volume Metrics:** Real-time counter for vehicles within a specific period to determine road saturation.
* **Visual Indicators:** Color-coded status updates (Green to Red) for instant situational awareness.


---

### 🛣️ Predictive Analysis & Route Recommendation

Once the simulation runs, the system processes the data through the optimal model to suggest the best path.

* **Optimal Model Selection:** Automatically identifies the architecture (Simple RNN, LSTM, or GRU) with the lowest RMSE.
* **Smart Routing:** Recommends alternative routes based on predicted congestion for segments like Harrison Road and Session Road.


---

## Model Architecture & Training

The system evaluates three primary sequential models to determine the best fit for Baguio's traffic patterns:

| Model | Justification |
| --- | --- |
| **Simple RNN** | Validated for capturing basic sequential traffic patterns in unique topographies. |
| **LSTM** | Utilized to manage long-term dependencies and "memory" of traffic peaks. |
| **GRU** | A streamlined alternative to LSTM for efficient real-time prediction. |

**Data Strategy:**

* **Hybrid Dataset:** 70% Simulated Data / 30% Original Traffic Data.
* **Target Metric:** Scaled focus on **Vehicle Volume** and speed trends.
* **Evaluation:** Models are mapped to a specific 1.0 to 5.5 performance scale for academic validation.

---

## Technical Workflow

* **Target Segments:** Focused on major Baguio arteries: North (Gov. Pack / Session), South (Convention), East (Harrison), and West (Kisad Road).
* **Frontend:** Clean, dark-mode PWA interface designed for high-contrast visibility.
* **Backend:** Integrated RNN models processing historical and simulated traffic sequences.
* **Error Tracking:** Built-in comparison of MAE, MSE, and RMSE to ensure predictive accuracy.

---

## Project Context

This system was developed as a Thesis Project: **"RNN Optimization for Baguio City Traffic Prediction."** It aims to bridge the gap between theoretical deep learning and practical urban traffic management in the Cordillera region.
