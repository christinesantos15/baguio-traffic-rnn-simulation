def compute_congestion(volume, speed_list):
    """
    Calculates congestion index based on Baguio City road conditions.
    Speed baseline: 30 km/h (typical urban limit in Baguio)
    
    Returns index with interpretation:
    0-4.9: Light traffic - Free flow conditions
    5.0-9.9: Moderate traffic - Some delays
    10.0-14.9: Heavy traffic - Significant delays
    15.0+: Severe congestion - Gridlock conditions
    """
    if not speed_list or len(speed_list) == 0:
        return 0
    
    avg_speed = sum(speed_list) / len(speed_list)
    if avg_speed <= 0:
        return 0
    
    # Baguio City typical speed limits
    max_speed_limit = 30  # km/h (typical urban limit)
    min_speed_threshold = 5  # km/h (near gridlock)
    
    # Speed ratio (how much slower than ideal)
    # Higher ratio = more congestion
    speed_ratio = max_speed_limit / max(avg_speed, min_speed_threshold)
    
    # Volume factor (normalized to typical Baguio traffic)
    # Assuming average volume of 100 vehicles per period
    volume_factor = min(volume / 75, 2.5)  # Cap at 2.5x multiplier
    
    # Terrain factor for Baguio's unique topography
    # Baguio's hills can amplify congestion effects
    terrain_factor = 1.2
    
    # Calculate congestion index
    index = (speed_ratio * volume_factor * terrain_factor) * 2.5
    
    # Round to 2 decimal places
    return round(index, 2)

def get_congestion_level(index):
    """
    Returns descriptive congestion level
    """
    if index < 5:
        return "Light Traffic", "#2ecc71"  # Green
    elif index < 10:
        return "Moderate Traffic", "#f1c40f"  # Yellow
    elif index < 15:
        return "Heavy Traffic", "#e67e22"  # Orange
    else:
        return "Severe Congestion", "#e74c3c"  # Red