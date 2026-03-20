def compute_congestion(volume, speed_list):
    """
    Calculates congestion index based on UC-BCNHS 30km/h baseline.
    """
    avg_speed = sum(speed_list) / len(speed_list)
    if avg_speed <= 0: return 0
    
    # Baguio City Road baseline speed (km/h)
    max_speed_limit = 30 
    
    # Exponential Penalty: Speed drops cause index to spike
    speed_penalty = (max_speed_limit / avg_speed) ** 2
    
    # Scale index for the dashboard display
    index = (volume / 50) * speed_penalty * 10 
    return round(index, 2)