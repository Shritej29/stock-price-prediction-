import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { Tab } from '@headlessui/react';
import { ChartBarIcon, NewspaperIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import LineChart from "./LineChart";
import Login from "./login";
import StockNews from "./components/StockNews";
import StockDetails from "./components/StockDetails";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/" />;
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Dashboard() {
  const [symbol, setSymbol] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [predictDays, setPredictDays] = useState("");
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState("");
  const [initialPredictions, setInitialPredictions] = useState("");
  const [historicalData, setHistoricalData] = useState([]);
  const [currency, setCurrency] = useState('INR');
  const [inrCurrency, setInrCurrency] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (predictions) {
      if (currency === 'INR') {
        setInrCurrency(true);
        setPredictions(initialPredictions?.predictions_inr);
      }
      if (currency === 'USD') {
        setInrCurrency(false);
        setPredictions(initialPredictions?.predictions_usd);
      }
    }
  }, [currency, predictions, initialPredictions]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const handleInputChange = (e) => {
    setSymbol(e.target.value);
  };

  const handleDateChange = (e) => {
    const { id, value } = e.target;
    if (id === "startingDate") {
      setStartDate(value);
    } else if (id === "endingDate") {
      setEndDate(value);
    } else if (id === "predictDays") {
      setPredictDays(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", {
        symbol,
        start_date: startDate,
        end_date: endDate,
        predict_days: predictDays
      });
      setInitialPredictions(response.data);
      setPredictions(response.data.predictions_inr);
      setHistoricalData(response.data.historical_data);
      setError("");
    } catch (err) {
      setError("Could not fetch predictions. Please check the stock symbol and input values.");
    }
  };

  const tabs = [
    { name: 'Predictions', icon: ChartBarIcon },
    { name: 'News', icon: NewspaperIcon },
    { name: 'Details', icon: InformationCircleIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Stock Predictor</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  id="symbol"
                  value={symbol}
                  onChange={handleInputChange}
                  placeholder="e.g., AAPL"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="startingDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startingDate"
                  value={startDate}
                  onChange={handleDateChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="endingDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endingDate"
                  value={endDate}
                  onChange={handleDateChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="predictDays" className="block text-sm font-medium text-gray-700">
                  Prediction Days
                </label>
                <input
                  type="number"
                  id="predictDays"
                  value={predictDays}
                  onChange={handleDateChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Predict
              </button>
            </div>
          </form>
        </div>

        {predictions && (
          <>
            <div className="mt-8 bg-white shadow-lg rounded-lg">
              <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex rounded-t-lg border-b border-gray-200 bg-gray-50">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        classNames(
                          'flex-1 px-4 py-3 text-sm font-medium text-center focus:outline-none',
                          selected
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                            : 'text-gray-500 hover:text-gray-700'
                        )
                      }
                    >
                      <div className="flex items-center justify-center">
                        <tab.icon className="h-5 w-5 mr-2" />
                        {tab.name}
                      </div>
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel className="p-6">
                    <div className="flex justify-end mb-4">
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="currency"
                            value="USD"
                            checked={currency === 'USD'}
                            onChange={() => setCurrency('USD')}
                            className="form-radio text-indigo-600"
                          />
                          <span className="ml-2">USD</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="currency"
                            value="INR"
                            checked={currency === 'INR'}
                            onChange={() => setCurrency('INR')}
                            className="form-radio text-indigo-600"
                          />
                          <span className="ml-2">INR</span>
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <LineChart predictions={predictions} historicalData={historicalData} inrCurrency={inrCurrency} />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Predicted Prices</h3>
                        <ul className="space-y-2">
                          {predictions.map((price, index) => (
                            <li key={index} className="flex justify-between">
                              <span>Day {index + 1}:</span>
                              <span className="font-medium">
                                {currency === 'USD' ? '$' : '₹'}{price.toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Tab.Panel>
                  <Tab.Panel>
                    <StockNews symbol={symbol} />
                  </Tab.Panel>
                  <Tab.Panel>
                    <StockDetails symbol={symbol} />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
