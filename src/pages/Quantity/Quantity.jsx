import React, { useEffect, useState } from "react";
import { fetchAverageDataByUserName, fetchDifferenceDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import { useDispatch, useSelector } from 'react-redux';
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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useOutletContext } from 'react-router-dom';
import Layout from '../Layout/Layout';
import Hedaer from "../Header/Hedaer";
import DashboardSam from "../Dashboard/DashboardSam";

const Quantity = () => {
  const dispatch = useDispatch();
  const { averageData, differenceData, loading, error } = useSelector((state) => state.iotData);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [interval, setInterval] = useState("year");

  // Get searchTerm (selected user) from the Outlet context
  const { searchTerm } = useOutletContext();

  // Fetch data based on searchTerm (userName) and interval
  const fetchData = async (userName) => {
    try {
      await dispatch(fetchAverageDataByUserName({ userName, interval })).unwrap();
    } catch (error) {
      toast.error(`Average Data for ${interval} is not found`);
    }

    try {
      await dispatch(fetchDifferenceDataByUserName(userName)).unwrap();
      setSearchResult(userName);
      setSearchError("");
    } catch (error) {
      toast.error("Difference data is not found");
      setSearchResult(null);
      setSearchError("No result found for this userID");
    }
  };

  // Effect to fetch data when searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      fetchData(searchTerm);  // Fetch data for the selected user
      console.log(`Fetching data for: ${searchTerm}`);
    }
  }, [searchTerm, interval, dispatch]);

  // Handle interval changes
  const handleIntervalChange = (newInterval) => {
    setInterval(newInterval);
    if (searchResult) {
      dispatch(fetchAverageDataByUserName({ userName: searchResult, interval: newInterval }))
        .unwrap()
        .catch(() => toast.error(`Average Data for ${newInterval} is not found`));
    }
  };

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    if (interval === "hour") {
      return date.toLocaleTimeString();
    } else if (interval === "day") {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (interval === "week" || interval === "sixmonth") {
      return date.toLocaleDateString();
    } else if (interval === "month") {
      return date.toLocaleString('en-US', { month: 'short' });
    } else if (interval === "year") {
      return date.getFullYear();
    }
    return tickItem;
  };

  const getDatesHeaders = () => {
    if (!differenceData || differenceData.length === 0) return [];
    return ['date']; // Assuming these are the date headers
  };

  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  return (
    <div>
      <div className="container-fluid">
        <div className="row" style={{ backgroundColor: 'white' }}>
        <div className="col-lg-3 d-none d-lg-block ">
                    <DashboardSam />
                </div>
          <div className="col-lg-9 col-12 ">
            <div className="row">
              <div className="col-12">
                <Hedaer/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row">
        <div className="col-lg-3 d-none d-lg-block">
         </div>
          <div className="col-lg-9 col-12">
            <div className="row">
              <div className="col-12">
                <div className="content-wrapper">
                  <div className="row page-title-header">
                    <div className="col-12">
                      <div className="page-header">
                        <h4 className="page-title">Quantity Dashboard</h4>
                      </div>
                    </div>
                  </div>

                  <div className="card mb-4">
                    <div className="card-body">
                      <h1>{searchResult ? `User: ${searchResult}` : searchError}</h1>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-body">
                      <div className="row mt-5">
                        <div className="col-md-12">
                          <h2>Water Flow</h2>
                          <div className="table-responsive mt-3">
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Sl.No</th>
                                  <th>Parameter</th>
                                  {getDatesHeaders().map((date, index) => (
                                    <th key={index}>{date}</th>
                                  ))}
                                  <th>Inflow Difference</th>
                                  <th>Final Flow Difference</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Array.isArray(differenceData) && differenceData.length > 0 ? (
                                  differenceData.map((data, index) => (
                                    <React.Fragment key={index}>
                                      <tr>
                                        <td>{index + 1}</td>
                                        <td>FL-Inlet raw sewage,KLD</td>
                                        <td>{data.date}<br/>{data.day}</td>
                                        <td>{data.inflowDifference}</td>
                                        <td></td>
                                      </tr>
                                      <tr>
                                        <td>{index + 1}</td>
                                        <td>FL-Treated Water,KLD</td>
                                        <td>{data.date}<br/>{data.day}</td>
                                        <td></td>
                                        <td>{data.finalflowDifference}</td>
                                      </tr>
                                    </React.Fragment>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={getDatesHeaders().length + 5} className="text-center">No data available</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                          <ToastContainer />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card mt-4 mb-5">
                    <div className="card-body">
                      <div className="row mt-5">
                        <div className="col-md-12">
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
                            <BarChart data={searchResult ? averageData : []}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="inflow" fill="#8884d8" />
                              <Bar dataKey="finalflow" fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>

                  <footer className="footer">
                    <div className="container-fluid clearfix">
                      <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
                        AquaBox Control and Monitor System
                      </span>
                      <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
                        © <a href="" target="_blank">EnviRobotics</a> 2022
                      </span>
                    </div>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quantity;
