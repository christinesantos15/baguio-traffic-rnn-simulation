from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
from data_loader import load_and_filter_data
from sequence_builder import build_sequences
from model_runner import run_rnn_models
from congestion import compute_congestion

app = Flask(__name__)
CORS(app)

# --- HELPER LOGIC FOR DIVERSIONS ---
def generate_recommendation(selected_direction, predicted_speed):
    # Mapping the EXACT strings from your dropdown to Baguio diversion routes
    diversion_map = {
        "North (City Center)": "Legarda Road or Magsaysay Avenue",
        "South (Residential)": "Military Cut-off Road or Loakan Road",
        "East (Commercial)": "South Drive or Outlook Drive",
        "West (Suburban)": "Naguilian Road or Bokawkan Road"
    }

    # Threshold: 18.0 km/h (Matches your 14.85 km/h scenario)
    if predicted_speed < 18.0:
        # Get the specific diversion based on the direction label
        route_alt = diversion_map.get(selected_direction)
        
        if route_alt:
            return f"⚠️ PEAK HOUR WARNING: Speed dropped to {predicted_speed}km/h. Divert via {route_alt}."
        else:
            # This handles cases where the string might have extra spaces or slight variations
            return f"⚠️ PEAK HOUR WARNING: Speed dropped to {predicted_speed}km/h. Divert via the nearest secondary artery."
    else:
        return f"✅ CLEAR ROUTE. The standard {selected_direction} path is optimal."

@app.route("/run-simulation", methods=["POST"])
def run_simulation():
    try:
        # 1. Parse scenario from Frontend
        scenario = request.json
        df = load_and_filter_data(scenario)

        if df.empty:
            return jsonify({"error": "No data found for this selection."}), 404

        # 2. Process AI Models
        X, y = build_sequences(df)
        model_data = run_rnn_models(X, y)
        
        # 3. Prepare Chart Visuals
        recent_df = df.tail(20)
        chart_data = {
            "labels": recent_df["timestamp"].dt.strftime('%H:%M').tolist(),
            "actual": recent_df["speed_kmh"].tolist()
        }

        # 4. Extract Simple RNN performance
        simple_rnn_speed = model_data["Simple RNN"]["predicted_speed"]
        cong_idx = compute_congestion(len(df), [simple_rnn_speed])
        
        for model in model_data:
            model_data[model]["compute_index"] = cong_idx

        # 5. Generate Specific Route Recommendation
        # We get the direction from the dropdown; default to North if not found
        direction = scenario.get("direction", "North: Harrison Road / UC Main")
        route_recommendation = generate_recommendation(direction, simple_rnn_speed)

        # 6. Determine Conclusion
        best_model = min(model_data, key=lambda x: model_data[x]['rmse'])
        conclusion_text = f"The {best_model} is the most optimal model with an RMSE of {model_data[best_model]['rmse']}."

        # 7. Send JSON Response back to Dashboard
        return jsonify({
            "results": model_data, 
            "vehicle_volume": len(df), 
            "chart_data": chart_data,
            "conclusion": conclusion_text,
            "recommended_route": route_recommendation
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Ensure port 5000 is open on your local machine
    app.run(debug=True, port=5000)