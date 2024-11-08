import React, { useState, useEffect } from "react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Dummy Data
const dummyData = [
  { timestamp: "2024-07-08", inflow: 50, finalflow: 30 },
  { timestamp: "2024-07-09", inflow: 60, finalflow: 35 },
  { timestamp: "2024-07-10", inflow: 55, finalflow: 32 },
  { timestamp: "2024-07-11", inflow: 70, finalflow: 40 },
  { timestamp: "2024-07-12", inflow: 65, finalflow: 38 },
];

const TotalSewageGraph = () => {
  const [averageData, setAverageData] = useState([]);
  const [interval, setInterval] = useState("day");

  useEffect(() => {
    // Simulate fetching data with dummy data
    setAverageData(dummyData);
  }, []);

  const handleIntervalChange = (newInterval) => {
    setInterval(newInterval);
    console.log(`Interval changed to: ${newInterval}`);
  };

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    switch (interval) {
      case "hour":
        return date.toLocaleTimeString();
      case "day":
        return date.toLocaleDateString("en-US", { weekday: "short" });
      case "week":
      case "sixmonth":
        return date.toLocaleDateString();
      case "month":
        return date.toLocaleString("en-US", { month: "short" });
      case "year":
        return date.getFullYear();
      default:
        return tickItem;
    }
  };

  return (
    <div className="card mt-4 mb-5 col-lg-12">
      <div className="card-body">
        <h2 className="m-3">Total FL Sewage Graph</h2>
        <div className="btn-group" role="group">
          <button type="button" className="btn btn-primary" onClick={() => handleIntervalChange('hour')}>Hour</button>
          <button type="button" className="btn btn-primary" onClick={() => handleIntervalChange('day')}>Day</button>
          <button type="button" className="btn btn-primary" onClick={() => handleIntervalChange('week')}>Week</button>
          <button type="button" className="btn btn-primary" onClick={() => handleIntervalChange('month')}>Month</button>
          <button type="button" className="btn btn-primary" onClick={() => handleIntervalChange('sixmonth')}>Six Months</button>
          <button type="button" className="btn btn-primary" onClick={() => handleIntervalChange('year')}>Year</button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={averageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="inflow" fill="#8884d8" />
            <Bar dataKey="finalflow" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
        <ToastContainer />
      </div>
    </div>
  );
};

export default TotalSewageGraph;