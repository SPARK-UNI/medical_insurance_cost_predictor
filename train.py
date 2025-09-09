import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from keras.models import Sequential
from keras.layers import Dense

import joblib

df = pd.read_csv("insurance.csv")

le_sex = LabelEncoder()
le_smoker = LabelEncoder()
le_region = LabelEncoder()

df["sex"] = le_sex.fit_transform(df["sex"])      
df["smoker"] = le_smoker.fit_transform(df["smoker"]) 
df["region"] = le_region.fit_transform(df["region"])

X = df[["age", "sex", "bmi", "children", "smoker", "region"]].values
y = df["expenses"].values

scaler = StandardScaler()
X = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = Sequential([
    Dense(64, activation="relu", input_shape=(X_train.shape[1],)),
    Dense(32, activation="relu"),
    Dense(1) 
])

model.compile(optimizer="adam", loss="mse", metrics=["mae"])

history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=100,
    batch_size=32,
    verbose=1
)

loss, mae = model.evaluate(X_test, y_test, verbose=0)
print(f"Test MAE: {mae:.2f}")

plt.figure(figsize=(12,5))

plt.subplot(1,2,1)
plt.plot(history.history["loss"], label="Train Loss")
plt.plot(history.history["val_loss"], label="Val Loss")
plt.xlabel("Epochs")
plt.ylabel("MSE Loss")
plt.title("Training vs Validation Loss")
plt.legend()

plt.subplot(1,2,2)
plt.plot(history.history["mae"], label="Train MAE")
plt.plot(history.history["val_mae"], label="Val MAE")
plt.xlabel("Epochs")
plt.ylabel("MAE")
plt.title("Training vs Validation MAE")
plt.legend()

plt.tight_layout()
plt.show()

sample = np.array([[19, 1, 27.9, 0, 1, 3]])  
sample = scaler.transform(sample)
pred = model.predict(sample)
print(f"Predicted charges: {pred[0][0]:.2f}")

model.save("insurance_model.h5")
joblib.dump(scaler, 'scaler.pkl') # <-- Thêm dòng này vào cuối file
print("Model và scaler đã được lưu!")