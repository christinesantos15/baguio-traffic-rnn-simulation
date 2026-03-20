import pandas as pd
from sklearn.model_selection import train_test_split

# 1. Load both datasets
df_simulated = pd.read_csv('Simulated_Traffic_Sept.csv')
df_original = pd.read_csv('Original_Traffic - Sheet.csv')

# Ensure original data has the same columns as simulated
# (You might need to adjust these names to match your original CSV exactly)
if 'speed_kmh' not in df_original.columns:
    # Example: if your original column is just 'speed', rename it
    df_original = df_original.rename(columns={'speed': 'speed_kmh'})

# 2. Define target total rows for training (e.g., 104,406)
total_rows = 104406
n_sim = int(total_rows * 0.70)
n_orig = int(total_rows * 0.30)

# 3. Sample from each (use replace=True if original data is small)
df_sim_sampled = df_simulated.sample(n=n_sim, replace=True)
df_orig_sampled = df_original.sample(n=n_orig, replace=True)

# 4. Concatenate and Shuffle
training_df = pd.concat([df_sim_sampled, df_orig_sampled], axis=0)
training_df = training_df.sample(frac=1).reset_index(drop=True)

# 5. Save for your Dashboard/RNN Model
training_df.to_csv('Final_Training_Data.csv', index=False)

print(f"Training data ready! Total rows: {len(training_df)}")
print(f"Simulated: {n_sim} rows | Original: {n_orig} rows")