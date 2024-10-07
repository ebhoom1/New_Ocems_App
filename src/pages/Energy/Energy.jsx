import React, { useEffect, useState } from 'react';
import DashboardSam from '../Dashboard/DashboardSam';
import { Chart, registerables } from 'chart.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName, fetchAverageDataByUserName, fetchDifferenceDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useOutletContext } from 'react-router-dom';
import Hedaer from '../Header/Hedaer';
import Layout from '../Layout/Layout';
import { Bar } from 'recharts';
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart } from 'recharts';

Chart.register(...registerables);

function Energy() {
  const dispatch = useDispatch();
  const outletContext = useOutletContext() || {};

  const { userId } = useSelector((state) => state.selectedUser); 
  const { searchTerm = '', searchStatus = '', handleSearch = () => {}, isSearchTriggered = false } = outletContext;
  const { userData, userType } = useSelector((state) => state.user);
  const { averageData, differenceData, loading, error } = useSelector((state) => state.iotData);
  const [interval, setInterval] = useState("year");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState("KSPCB001");
  const [companyName, setCompanyName] = useState("");

  const fetchData = async (userName) => {
    setSearchError("");
    try {
      const result = await dispatch(fetchIotDataByUserName(userName)).unwrap();
      setSearchResult(result);
      setCompanyName(result?.companyName || "Unknown Company");
    } catch (err) {
      setSearchResult(null);
      setCompanyName("Unknown Company");
      setSearchError(err.message || 'No Result found for this userID');
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (userId) {
      fetchData(userId);
    } else {
      fetchData(currentUserName);
    }
  }, [userId, currentUserName, searchTerm, dispatch]);

  // Fetch energy-related data (average and difference)
  useEffect(() => {
    const fetchData = async () => {
      if (!userData || userType !== 'user') return;

      try {
        await dispatch(fetchAverageDataByUserName({ userName: userData.validUserOne.userName, interval })).unwrap();
      } catch (error) {
        toast.error(`Average Data for ${interval} is not found`);
      }

      try {
        await dispatch(fetchDifferenceDataByUserName(userData.validUserOne.userName)).unwrap();
      } catch (error) {
        toast.error("Difference data is not found");
      }
    };

    fetchData();
  }, [userData, userType, interval, dispatch]);

  // Handle interval changes
  const handleIntervalChange = (newInterval) => {
    setInterval(newInterval);
    fetchData(currentUserName);
  };

  // Format X-axis based on the interval
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
    return ['Date']; // Assuming these are the date headers
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 d-none d-lg-block ">
          <DashboardSam />
        </div>
        
        {/* Main content */}
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <Hedaer />
            </div>
          </div>

          <div className="content-wrapper">
            <div className="row page-title-header">
              <div className="col-12">
                <div className="page-header">
                  <h4 className="page-title">Energy Dashboard</h4>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h1>{searchResult ? `User: ${searchResult}` : searchError}</h1>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <div className="row mt-5">
                  <div className="col-md-12">
                    <h2>Energy Consumption</h2>
                    <div className="table-responsive mt-3">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Sl.No</th>
                            <th>Parameter</th>
                            {getDatesHeaders().map((date, index) => (
                              <th key={index}>{date}</th>
                            ))}
                            <th>Initial Energy</th>
                            <th>Final Energy</th>
                            <th>Energy Difference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {differenceData.map((data, index) => (
                            <React.Fragment key={index}>
                              <tr>
                                <td>{index + 1}</td>
                                <td>FL-STP Incomer Energy Consumption, kWh</td>
                                <td>{data.date}<br/>{data.day}</td>
                                <td>{data.initialEnergy}</td>
                                <td>{data.finalEnergy}</td>
                                <td>{data.energyDifference}</td>
                              </tr>
                            </React.Fragment>
                          ))}
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
                    <h2 className="m-3">Total Energy Consumption Graph</h2>
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
                        <Bar dataKey="energy" fill="#82ca9d" />
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
  );
}

export default Energy;
