import React from "react";
import { Chart } from "react-google-charts";

export const options = {
    chart: {
        title: "Stock Prices and Predictions",
        subtitle: "Historical stock prices and predicted stock prices",
    },
    colors: ['#4285F4', '#ffda07'], // Blue for historical, Yellow for predictions
    hAxis: {
        title: "Date",
        format: 'MMM dd, yyyy',  // Format for dates on X-axis
        gridlines: { count: 15 },
    },
    vAxis: {
        title: "Stock Price",
    },
    series: {
        0: { labelInLegend: "Historical Data" },
        1: { labelInLegend: "Predictions" },
    },
};

export default function LineChart({ predictions, historicalData, inrCurrency }) {
    const currencyFormat = inrCurrency ? 'Adj Close INR' : 'Adj Close';

    // Function to calculate future dates based on the last date in historical data
    const calculateFutureDates = (startDate, days) => {
        const futureDates = [];
        const currentDate = new Date(startDate);
        for (let i = 0; i < days; i++) {
            currentDate.setDate(currentDate.getDate() + 1);
            futureDates.push(new Date(currentDate).toISOString().split('T')[0]); // Format as YYYY-MM-DD
        }
        return futureDates;
    };

    // Get the last date from the historical data
    const lastHistoricalDate = historicalData[historicalData.length - 1]?.Date;

    // Construct chart data with historical and predicted data
    const chartData = [
        ["Date", "Historical Price", "Prediction"],  // Column headers
        ...historicalData.map((data) => [
            new Date(data.Date).toISOString().split('T')[0],  // Format date as YYYY-MM-DD
            data[currencyFormat],  // Historical price (either in USD or INR)
            null,  // No predictions for historical data
        ]),
        ...calculateFutureDates(lastHistoricalDate, predictions.length).map((date, index) => [
            date,
            null,  // No historical data for future dates
            predictions[index],  // Predictions
        ]),
    ];

    return (
        <Chart
            chartType="Line"
            width="900px"
            height="400px"
            data={chartData}
            options={options}
        />
    );
}
