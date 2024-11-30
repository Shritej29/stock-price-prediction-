from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import numpy as np
from sklearn.linear_model import LinearRegression
import requests
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required


app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Use a strong secret key
jwt = JWTManager(app)

@app.route('/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')
    # Add user to your database (use hashed passwords in production)
    return jsonify({"msg": "User registered successfully"}), 200

    @app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    # Replace with database validation
    if username == 'testuser' and password == 'testpass':
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    return jsonify(msg="This is a protected route")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Define a request body model for stock prediction input
class StockRequest(BaseModel):
    symbol: str
    start_date: str
    end_date: str
    predict_days: int

# Function to get the latest exchange rate for USD to INR
def get_usd_to_inr_rate():
    response = requests.get("https://api.exchangerate-api.com/v4/latest/USD")
    data = response.json()
    if "rates" in data and "INR" in data["rates"]:
        return data["rates"]["INR"]
    else:
        raise HTTPException(status_code=500, detail="Could not fetch exchange rate.")

# Endpoint to fetch stock data and make predictions
@app.post("/predict")
async def predict_stock(stock_request: StockRequest):
    try:
        # Fetch stock data for the requested symbol and date range
        stock_data = yf.download(stock_request.symbol, start=stock_request.start_date, end=stock_request.end_date)
        stock_data = stock_data[['Adj Close']]

        # Check if there is enough data for prediction
        if len(stock_data) < stock_request.predict_days:
            raise HTTPException(status_code=400, detail="Not enough data for the specified prediction days.")

        # Prepare the data for prediction (shift by the number of days to predict)
        future_days = stock_request.predict_days
        stock_data['Prediction'] = stock_data[['Adj Close']].shift(-future_days)
        X = np.array(stock_data.drop(['Prediction'], axis=1))[:-future_days]
        y = np.array(stock_data['Prediction'])[:-future_days]

        # Train a Linear Regression model
        model = LinearRegression()
        model.fit(X, y)

        # Predict future stock prices (for the specified number of future days)
        future_X = np.array(stock_data.drop(['Prediction'], axis=1))[-future_days:]
        predictions = model.predict(future_X)

        # Convert predictions and historical data to INR
        usd_to_inr_rate = get_usd_to_inr_rate()
        predictions_inr = predictions * usd_to_inr_rate

        # Convert historical stock data to INR
        stock_data['Adj Close INR'] = stock_data['Adj Close'] * usd_to_inr_rate

        # Convert historical stock data to a list of dictionaries to be returned
        historical_data = stock_data[:-future_days].reset_index().to_dict(orient="records")

        # Return the predicted values and historical stock data as JSON
        return {
            "historical_data": historical_data,  # Return historical stock data in USD and INR
            "predictions_usd": predictions.tolist(),
            "predictions_inr": predictions_inr.tolist(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
