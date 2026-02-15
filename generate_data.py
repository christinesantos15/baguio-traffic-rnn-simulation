import pandas as pd
import numpy as np
import datetime

# 1. Load your original data
df_original = pd.read_csv('Original_Traffic.csv')

# 2. Setup the timeframe (Sept 1 to Sept 30, 2026)
start_date = datetime.datetime(2026, 9, 1, 0, 0)
end_date = datetime.datetime(2026, 9, 30, 23, 59)

# Define how many total rows you want in your final simulation
# For example: 104,406 rows to simulate a busy month
num_rows = 104406

# 3. Generate Random Timestamps
random_secs = np.random.randint(0, int((end_date - start_date).total_seconds()), num_rows)
timestamps = [start_date + datetime.timedelta(seconds=int(s)) for s in random_secs]

# 4. Create the new DataFrame
sim_df = pd.DataFrame({'timestamp': timestamps})
sim_df['hour'] = sim_df['timestamp'].dt.hour

# 5. Apply Logic
# Direction
sim_df['direction'] = np.random.choice(['N', 'S', 'E', 'W'], size=num_rows)

# Peak Period (4pm to 6pm is hour 16 and 17)
sim_df['period'] = sim_df['hour'].apply(lambda x: 'Peak' if 16 <= x < 18 else 'Non-Peak')

# Speed logic based on your article
def assign_speed(period):
    if period == 'Peak':
        return np.random.uniform(10, 20) # 10-20 km/h
    else:
        return np.random.uniform(20, 30) # 20-30 km/h

sim_df['speed_kmh'] = sim_df['period'].apply(assign_speed)

# 6. Save the result
sim_df = sim_df.sort_values('timestamp')
sim_df.to_csv('Simulated_Traffic_Sept.csv', index=False)

print("Simulation complete! Created 'Simulated_Traffic_Sept.csv'")

# Load the newly created simulation
df = pd.read_csv('Simulated_Traffic_Sept.csv')

# Display the first 10 rows
print("--- First 10 Rows of Simulated Data ---")
print(df.head(10))

# Verify the Speed Constraints
print("\n--- Average Speed by Period ---")
print(df.groupby('period')['speed_kmh'].agg(['min', 'max', 'mean']))
