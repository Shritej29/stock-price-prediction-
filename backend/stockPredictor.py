import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import yfinance as yf

# Fetch stock data (Apple in this case)
stock_data = yf.download('AAPL', start='2024-01-01', end='2024-09-28')

# Use 'Adj Close' for prediction
stock_data = stock_data[['Adj Close']]

# Predict stock prices for the next 30 days
future_days = 30
stock_data['Prediction'] = stock_data[['Adj Close']].shift(-future_days)

# Prepare the feature and target datasets
X = np.array(stock_data.drop(['Prediction'], axis=1))[:-future_days]
y = np.array(stock_data['Prediction'])[:-future_days]

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Create and train the Linear Regression model
model = LinearRegression()
model.fit(X_train, y_train)

# Predict on the test data
predictions = model.predict(X_test)

# Print predictions and actual values
print("Predictions: ", predictions)
print("Actual values: ", y_test)

# Predict the future stock prices (next 30 days)
future_X = np.array(stock_data.drop(['Prediction'], axis=1))[-future_days:]
future_predictions = model.predict(future_X)
print("Future stock prices: ", future_predictions)

# Visualize the results
valid = stock_data[X.shape[0]:]
valid['Predictions'] = future_predictions

plt.figure(figsize=(16,4))
plt.title('Stock Price Prediction')
plt.xlabel('Days')
plt.ylabel('Adj Close Price USD ($)')
plt.plot(stock_data['Adj Close'])
plt.plot(valid[['Adj Close', 'Predictions']])
plt.legend(['Original', 'Valid', 'Predicted'])
plt.show()
