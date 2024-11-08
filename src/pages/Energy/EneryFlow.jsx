import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import { io } from 'socket.io-client';
import EnergyGraphPopup from './EnergyGraphPopup';
import { useOutletContext } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import { API_URL } from "../../utils/apiConfig";
import DailyHistoryModal from "../Water/DailyHIstoryModal";

console.log('Connecting to:', API_URL);
const socket = io(API_URL, { transports: ['websocket'], reconnectionAttempts: 5 });

const EnergyFlow = () => {
  const dispatch = useDispatch();
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const { userData, userType } = useSelector((state) => state.user);
  const { latestData } = useSelector((state) => state.iotData);
  const [realTimeData, setRealTimeData] = useState(null); // State for real-time data
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const { searchTerm } = useOutletContext();
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState(
    userType === 'admin' ? "KSPCB001" : userData?.validUserOne?.userName
  );
  const [companyName, setCompanyName] = useState("");
  const [userName, setUserName] = useState(""); // State to store user name
  const [loading, setLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState("all");
  const [energyStacks, setEnergyStacks] = useState([]);
  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve userId from session storage
  // Fetch energy stacks
  const fetchEnergyStacks = async (userName) => {
    try {
      const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
      const data = await response.json();
      const stacks = data.stackNames
        .filter(stack => stack.stationType === 'energy')
        .map(stack => stack.name);
      setEnergyStacks(stacks);
    } catch (error) {
      console.error("Error fetching energy stacks:", error);
    }
  };
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("selectedUserId");
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    
    if (userName) {
      fetchData(userName);
      if (storedUserId) {
        setCurrentUserName(storedUserId);
        console.log("Stored User ID:", storedUserId); 
        console.log(setCurrentUserName);
        console.log(setCompanyName);
        
        // Debugging
      }
    }
  }, [selectedUserIdFromRedux, currentUserName, dispatch]);
  const fetchData = async (userName) => {
    setLoading(true);
    try {
      const result = await dispatch(fetchIotDataByUserName(userName)).unwrap();
      setSearchResult(result);
      setCompanyName(result?.companyName || "Unknown Company");
      setUserName(result?.validUserOne?.name || "Unknown User"); // Set the user's name here
      setSearchError("");
    } catch (err) {
      setSearchResult(null);
      setCompanyName("Unknown Company");
      setUserName("Unknown User"); // Set default if there's an error
      setSearchError(err.message || 'No Result found for this userID');
    } finally {
      setLoading(false);
    }
  };

  // Update company name whenever search result changes
  useEffect(() => {
    if (searchResult) {
      setCompanyName(searchResult?.companyName || "Unknown Company");
      setUserName(searchResult?.validUserOne?.name || "Unknown User"); // Update user's name
    }
  }, [searchResult]);

  // Fetch initial data and stacks
  useEffect(() => {
    const userNameToSearch = storedUserId || currentUserName;
    fetchData(userNameToSearch);
    fetchEnergyStacks(userNameToSearch);
  }, [storedUserId, currentUserName]);

  // Connect to the WebSocket server and listen for real-time data updates
  useEffect(() => {
    const userName = storedUserId || currentUserName;
    console.log('Joining room:', userName);

    socket.emit('joinRoom', { userId: userName });

    socket.on('energyDataUpdate', (data) => {
      console.log('Received real-time data:', data);
      setRealTimeData({ ...data });
    });

    return () => {
      console.log('Leaving room:', userName);
      socket.emit('leaveRoom', { userId: userName });
      socket.off('energyDataUpdate');
    };
  }, [storedUserId, currentUserName]);

  // Handle next and previous user navigation
  const handleNextUser = () => {
    const userIdNumber = parseInt(currentUserName.replace(/[^\d]/g, ''), 10);
    if (!isNaN(userIdNumber)) {
      const newUserId = `KSPCB${String(userIdNumber + 1).padStart(3, '0')}`;
      setCurrentUserName(newUserId);
    }
  };

  const handlePrevUser = () => {
    const userIdNumber = parseInt(currentUserName.replace(/[^\d]/g, ''), 10);
    if (!isNaN(userIdNumber) && userIdNumber > 1) {
      const newUserId = `KSPCB${String(userIdNumber - 1).padStart(3, '0')}`;
      setCurrentUserName(newUserId);
    }
  };

  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };

  const energyParameters = [
    { parameter: "Energy", value: 'kW/hr', name: 'energy' },
    { parameter: "Current", value: 'A', name: 'current' },
    { parameter: "Voltage", value: 'V', name: 'voltage' },
    { parameter: "Power", value: 'kW', name: 'power' }
  ];

  return (
    <div className="content-wrapper">
      <div className="row page-title-header">
        <div className="col-12">
          <div className="page-header d-flex justify-content-between">
            {userType === 'admin' ? (
              <>
                <button className="btn text-light " style={{backgroundColor:'#236a80'}} onClick={handlePrevUser} disabled={loading}>Prev</button>
                <h4 className="page-title">Energy Dashboard</h4>
                <button className="btn text-light " style={{backgroundColor:'#236a80'}} onClick={handleNextUser} disabled={loading}>Next</button>
              </>
            ) : (
              <div className="mx-auto">
                <h4 className="page-title">Energy Dashboard</h4>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row align-items-center">
        <div className="col-md-4">
          {searchResult?.stackData && (
            <div className="stack-dropdown">
              <label htmlFor="stackSelect" className="label-select">Select Station:</label>
              <select
                id="stackSelect"
                className="form-select styled-select"
                value={selectedStack}
                onChange={handleStackChange}
              >
                <option value="all">All Stacks</option>
                {searchResult.stackData
                  .filter(stack => energyStacks.includes(stack.stackName))
                  .map((stack, index) => (
                    <option key={index} value={stack.stackName}>{stack.stackName}</option>
                  ))}
              </select>
            </div>
          )}
        </div>
        <div className="col-md-4">
          <h3 className="text-center"> {companyName}</h3>
          <h5 className="text-center"></h5> {/* User's name displayed here */}
        </div>
        <div className="col-md-4 d-flex justify-content-end">
          <button className="btn text-light" style={{backgroundColor:'#236a80'}} onClick={() => setShowHistoryModal(true)}>Daily History</button>
        </div>
      </div>

      {loading && (
        <div className="spinner-container">
          <Oval height={60} width={60} color="#236A80" ariaLabel="Loading" />
        </div>
      )}

      <div className="row">
        {!loading && realTimeData && (
          <div className="col-12 mb-4">
            <div className="stack-box">
              <h4 className="text-center">Real-Time Data</h4>
              <div className="row">
                {energyParameters.map((param, index) => (
                  <div className="col-12 col-md-4 grid-margin mb-3" key={index}>
                    <div className="card">
                      <div className="card-body">
                        <h3>{param.parameter}</h3>
                        <h6>
                          <strong>{realTimeData[param.name] || 'N/A'}</strong>
                          <span>{param.value}</span>
                        </h6>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <DailyHistoryModal isOpen={showHistoryModal} onRequestClose={() => setShowHistoryModal(false)} />
    </div>
  );
};

export default EnergyFlow;
