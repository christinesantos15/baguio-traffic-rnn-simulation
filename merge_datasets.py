import pandas as pd
import numpy as np

# 1. Load the files
# Using the filenames from your VS Code sidebar
df_orig = pd.read_csv('Original_Traffic.csv')
df_sim = pd.read_csv('Simulated_Traffic_Sept.csv')

# --- CLEAN COLUMN NAMES ---
# Strips hidden spaces like 'Time ' -> 'Time'
df_orig.columns = df_orig.columns.str.strip()
df_sim.columns = df_sim.columns.str.strip()

# 2. Standardize Original Data
# Convert 'Time' to datetime and extract components
df_orig['timestamp'] = pd.to_datetime(df_orig['Time'])
df_orig['hour'] = df_orig['timestamp'].dt.hour

# Determine Peak/Non-Peak for original data (4-6 PM logic)
df_orig['period'] = df_orig['hour'].apply(lambda x: 'Peak' if 16 <= x < 18 else 'Non-Peak')

# Rename columns to match Simulated data
df_orig = df_orig.rename(columns={
    'Vehicle Speed': 'speed_kmh',
    'Driving Direction': 'direction'
})

# Remove 'km/h' from speed and convert to numbers
df_orig['speed_kmh'] = df_orig['speed_kmh'].str.replace('km/h', '', case=False).astype(float)

# Map 'Forward' or other values to 'N' to match your dashboard's 'North' filter
df_orig['direction'] = 'N'

# Select only the columns that exist in both sets
cols_to_keep = ['timestamp', 'hour', 'direction', 'period', 'speed_kmh']
df_orig = df_orig[cols_to_keep]
df_sim = df_sim[cols_to_keep]

# 3. Combine Datasets (104,406 rows each)
# Using sampling with replace=True ensures we get the exact count requested
n_total = 104406
df_sim_final = df_sim.sample(n=n_total, replace=True)
df_orig_final = df_orig.sample(n=n_total, replace=True)

# 4. Final Merge and Shuffle
final_df = pd.concat([df_sim_final, df_orig_final], axis=0)
final_df = final_df.sample(frac=1).reset_index(drop=True)

# 5. Save as 'traffic.csv' for the dashboard
final_df.to_csv('traffic.csv', index=False)

print(f"✅ Successfully combined datasets!")
print(f"Total Rows: {len(final_df)} (50/50 split of {n_total} each)")