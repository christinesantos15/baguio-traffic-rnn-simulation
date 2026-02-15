import numpy as np

def build_sequences(df, window_size=5):
    """
    Turns flat traffic data into time-series windows.
    If window_size is 5, it uses the last 5 speeds to predict the 6th.
    """
    # Ensure we use the correct column name from your merged dataset
    if "speed_kmh" not in df.columns:
        return np.array([]), np.array([])
        
    speeds = df["speed_kmh"].values
    X, y = [], []

    if len(speeds) <= window_size:
        return np.array([]), np.array([])

    for i in range(len(speeds) - window_size):
        X.append(speeds[i:i + window_size])
        y.append(speeds[i + window_size])

    # Reshape X to be [samples, time_steps, features] for Deep Learning models
    X = np.array(X)
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))
    
    return X, np.array(y)