import pandas as pd
from datetime import timedelta
import os

def load_and_filter_data(scenario):
    file_path = 'traffic.csv'
    if not os.path.exists(file_path): return pd.DataFrame()
        
    df = pd.read_csv(file_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    # 1. Filter by Direction
    dir_map = {
        "North (City Center)": "N",
        "South (Residential)": "S",
        "East (Business Dist.)": "E",
        "West (Leisure Dist.)": "W"
    }
    df = df[df["direction"] == dir_map.get(scenario["direction"])]
    
    # 2. Filter by Period (Peak/Non-Peak)
    period = scenario["traffic_period"].replace(" ", "-") 
    df = df[df["period"] == period]

    # 3. Filter by Analysis Scale with Safety Fallback
    max_date = df["timestamp"].max()
    
    if scenario.get("time_scale") == "daily":
        filtered_df = df[df["timestamp"] > (max_date - timedelta(days=1))]
        # If less than 10 rows, expand to 3 days so the RNN has enough data
        if len(filtered_df) < 10:
            filtered_df = df[df["timestamp"] > (max_date - timedelta(days=3))]
    elif scenario.get("time_scale") == "weekly":
        filtered_df = df[df["timestamp"] > (max_date - timedelta(weeks=1))]
    else:
        filtered_df = df # Monthly Analysis

    return filtered_df.sort_values("timestamp")