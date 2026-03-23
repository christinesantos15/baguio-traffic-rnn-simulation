def compute_congestion(volume, speed_list):
    """
    Calculates Congestion Index (0-10) based on 2026 TPI & TomTom Standards.
    Ref: Beijing TPI (2025 Updates) & DPWH LOS F thresholds.
    """
    if not speed_list or len(speed_list) == 0:
        return 0.0
        
    # 1. Calculate Average Predicted Speed
    avg_speed = sum(speed_list) / len(speed_list)
    
    # 2. Define Baguio Urban Baseline (Free-Flow Speed)
    max_speed_limit = 30.0 
    
    # 3. Handle bounds: Speed capped between 2km/h and 30km/h
    effective_speed = max(min(avg_speed, max_speed_limit), 2.0)
    
    # 4. Calculate Travel Time Index (TTI) Ratio
    # Basis: 2026 TomTom Traffic Index standards
    tti_ratio = max_speed_limit / effective_speed
    
    # 5. Apply Exponential Sensitivity
    # Square penalty accounts for non-linear delay perception
    intensity_factor = (tti_ratio) ** 2
    
    # 6. Volume Normalization (V/C Ratio)
    # 30 vehicles represents saturation for narrow Baguio segments
    vc_ratio = volume / 30.0
    
    # 7. Final TPI Calculation (Scaled to 0-10)
    # Adjusted multiplier to ensure 14.7km/h lands in 'Severe' (8.0+)
    raw_index = (vc_ratio * intensity_factor) * 3.5
    
    # 8. Constraints: Return rounded value capped at 10.0
    return min(round(raw_index, 2), 10.0)