import React, { useState } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TotalSewageGraph = () => {
  const [interval, setInterval] = useState("year");

  // Dummy data for the BarChart
  const dummyData = [
    { date: "2023-01-01", inflow: 220, finalFlow: 180 },
    { date: "2023-02-01", inflow: 300, finalFlow: 260 },
    { date: "2023-03-01", inflow: 250, finalFlow: 240 },
    { date: "2023-04-01", inflow: 280, finalFlow: 250 },
    { date: "2023-05-01", inflow: 310, finalFlow: 290 },
    { date: "2023-06-01", inflow: 260, finalFlow: 240 },
    { date: "2023-07-01", inflow: 290, finalFlow: 270 },
    { date: "2023-08-01", inflow: 320, finalFlow: 300 },
    { date: "2023-09-01", inflow: 270, finalFlow: 250 },
    { date: "2023-10-01", inflow: 340, finalFlow: 320 },
  ];

  const handleIntervalChange = (newInterval) => {
    setInterval(newInterval);
    toast.info(`Interval changed to: ${newInterval}`);
  };

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    if (interval === "hour") {
      return date.toLocaleTimeString();
    } else if (interval === "day") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else if (interval === "week" || interval === "sixmonth") {
      return date.toLocaleDateString();
    } else if (interval === "month") {
      return date.toLocaleString("en-US", { month: "short" });
    } else if (interval === "year") {
      return date.getFullYear();
    }
    return tickItem;
  };

  return (
    <div className="cardnew mt-4 mb-5">
      <div className="card-body">
        <h2 className="m-3 mt-4">Total FL Sewage Graph</h2>
        <div className="btn-group" role="group">
          <button
            type="button"
            className="btn text-light "
            style={{backgroundColor:'#236a80'}}
            onClick={() => handleIntervalChange("hour")}
          >
            Hour
          </button>
          <button
            type="button"
            className="btn text-light"
            style={{backgroundColor:'#236a80'}}
            onClick={() => handleIntervalChange("day")}
          >
            Day
          </button>
          <button
            type="button"
            className="btn text-light "
            style={{backgroundColor:'#236a80'}}
            onClick={() => handleIntervalChange("week")}
          >
            Week
          </button>
          <button
            type="button"
            className="btn text-light"
            style={{backgroundColor:'#236a80'}}

            onClick={() => handleIntervalChange("month")}
          >
            Month
          </button>
          <button
            type="button"
            className="btn text-light"
            style={{backgroundColor:'#236a80'}}

            onClick={() => handleIntervalChange("sixmonth")}
          >
            Six Months
          </button>
          <button
            type="button"
            className="btn text-light "
            style={{backgroundColor:'#236a80'}}

            onClick={() => handleIntervalChange("year")}
          >
            Year
          </button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dummyData} style={{ color: "white" }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* Updated Colors */}
            <Bar dataKey="inflow" fill="#236a80" name="Inflow" />
            <Bar dataKey="finalFlow" fill="#74a3b6" name="Final Flow" />
          </BarChart>
        </ResponsiveContainer>
        <ToastContainer />
      </div>
    </div>
  );
};

export default TotalSewageGraph;
