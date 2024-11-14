import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName  ,fetchLatestIotData } from "../../redux/features/iotData/iotDataSlice";
import CalibrationPopup from "../Calibration/CalibrationPopup";
import CalibrationExceeded from '../Calibration/CalibrationExceeded';
import { Oval } from 'react-loader-spinner';
import DashboardSam from '../Dashboard/DashboardSam';
import Maindashboard from "../Maindashboard/Maindashboard";
import Hedaer from "../Header/Hedaer";
import { API_URL } from "../../utils/apiConfig";
import DailyHistoryModal from "../Water/DailyHIstoryModal";
import { io } from 'socket.io-client';
import { fetchUserLatestByUserName } from "../../redux/features/userLog/userLogSlice";
import WaterGraphPopup from "../Water/WaterGraphPopup";
import air from '../../assests/images/air.svg'
const socket = io(API_URL, { 
  transports: ['websocket'], 
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => console.log('Connected to Socket.IO server'));
socket.on('connect_error', (error) => console.error('Connection Error:', error));

const Airambient = () => {
  const dispatch = useDispatch();
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve userId from session storage
  const { userId } = useSelector((state) => state.selectedUser); 

  const { userData, userType } = useSelector((state) => state.user);
  const { latestData, error } = useSelector((state) => state.iotData);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCalibrationPopup, setShowCalibrationPopup] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState(userType === 'admin' ? "KSPCB001" : userData?.validUserOne?.userName);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState("all");
  const [searchResult, setSearchResult] = useState({ stackData: [] });
  const [emissionStacks, setEmissionStacks] = useState([]); // Store only emission-related stacks
  const [realTimeData, setRealTimeData] = useState({});

  
  // Fetch stack names and filter by emission-related station types
  const fetchEmissionStacks = async (userName) => {
    try {
      const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
      const data = await response.json(); // Make sure to parse the JSON
      const effluentStacks = data.stackNames
        .filter(stack => stack.stationType === 'emission')
        .map(stack => stack.name); // Use 'name' instead of 'stackName'
      setEmissionStacks(effluentStacks);
    } catch (error) {
      console.error("Error fetching effluent stacks:", error);
    }
  };

  const fetchData = async (userName) => {
    setLoading(true);
    try {
      const result = await dispatch(fetchUserLatestByUserName(userName)).unwrap();
  
      if (result) {
        setSearchResult(result); // Store the entire result object
        setCompanyName(result.companyName || "Unknown Company"); // Access companyName directly
        console.log('fetchData of Latest:', result); // Check if the result is logged correctly
        setSearchError("");
      } else {
        throw new Error("No data found for this user.");
      }
    } catch (err) {
      setSearchResult(null);
      setCompanyName("Unknown Company");
      setSearchError(err.message || 'No result found for this userID');
    } finally {
      setLoading(false);
    }
  };
  

  
  useEffect(() => {
    const storedUserId = sessionStorage.getItem('selectedUserId');
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    console.log(`username : ${userName}`);
    
    fetchData(userName);
    fetchEmissionStacks(userName); // Fetch emission stacks
    if (storedUserId) {
      setCurrentUserName(storedUserId);
    }
  }, [selectedUserIdFromRedux, currentUserName, dispatch]);


  useEffect(() => {
    const userName = storedUserId || currentUserName;
    console.log(`username : ${userName}`);
    
    console.log(`Joining room: ${userName}`);
    socket.emit('joinRoom', { userId: userName });
  
    socket.on('stackDataUpdate', (data) => {
      console.log(`Real-time data for ${userName}:`, data);
      if (data && data.stackData && data.stackData.length > 0) {
        setRealTimeData((prevData) => ({
          ...prevData,
          ...data.stackData.reduce((acc, item) => {
            acc[item.stackName] = item;
            return acc;
          }, {})
        }));
      } else {
        console.warn(`No data received for ${userName}`);
      }
    });
    
  
    return () => {
      console.log(`Leaving room: ${userName}`);
      socket.emit('leaveRoom', { userId: userName });
      socket.off('stackDataUpdate');
    };
  }, [storedUserId, currentUserName]);

  const fetchHistoryData = async (fromDate, toDate) => {
    // Logic to fetch history data based on the date range
    console.log('Fetching data from:', fromDate, 'to:', toDate);
  };

  const downloadHistoryData = (fromDate, toDate) => {
    // Logic to download history data based on the date range
    console.log('Downloading data from:', fromDate, 'to:', toDate);
  };

  useEffect(() => {
    if (userData?.validUserOne?.userType === 'user') {
      fetchData(userId); // Fetch data only for the current user if userType is 'user'
    } else if (userId) {
      dispatch(fetchIotDataByUserName(userId)); // For other userTypes, fetch data normally
    }
  }, [userId, dispatch]);
  useEffect(() => {
    if (userId) {
      dispatch(fetchIotDataByUserName(userId));
    }
  }, [userId, dispatch]);
 /*  useEffect(() => {
    const storedUserId = sessionStorage.getItem('selectedUserId');
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    fetchData(userName);
    fetchEmissionStacks(userName); 
    if (storedUserId) {
      setCurrentUserName(storedUserId);
    }
  }, [selectedUserIdFromRedux, currentUserName, dispatch]);
 */
  // Handle stack change
  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };
  const handleCardClick = (param, stackName) => {
    setSelectedCard({ title: param.name, stackName, userName: currentUserName });
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedCard(null);
  };

  const handleOpenCalibrationPopup = () => {
    setShowCalibrationPopup(true);
  };

  const handleCloseCalibrationPopup = () => {
    setShowCalibrationPopup(false);
  };

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

const filteredData = selectedStack === "all"
? Object.values(realTimeData).filter(stack => emissionStacks.includes(stack.stackName))
: Object.values(realTimeData).filter(stack => stack.stackName === selectedStack);

const airParameters = [
  { parameter: "Flow", value: 'm3/hr', name: "Flow" },
  { parameter: "CO", value: 'µg/Nm³', name: "CO" },
  { parameter: "NOX", value: 'µg/Nm³', name: "NOX" },
  { parameter: "Pressure", value: 'Pa', name: "Pressure" },
  { parameter: "PM", value: 'µg/m³', name: "PM" },
  { parameter: "SO2", value: 'mg/Nm3', name: "SO2" },
  { parameter: "NO2", value: 'µg/m³', name: "NO2" },
  { parameter: "Mercury", value: 'µg/m³', name: "Mercury" },
  { parameter: "PM 10", value: 'µg/m³', name: "PM10" },
  { parameter: "PM 2.5", value: 'µg/m³', name: "PM25" },
  { parameter: "Windspeed", value: 'm/s', name: "WindSpeed" },
  { parameter: "Wind Dir", value: 'deg', name: "WindDir" },
  { parameter: "Temperature", value: '℃', name: "AirTemperature" },
  { parameter: "Humidity", value: '%', name: "Humidity" },
  { parameter: "Solar Radiation", value: 'w/m²', name: "solarRadiation" },
  { parameter: "Fluoride", value: "mg/Nm3", name: "Fluoride" },
  {parameter: "NH3", value: "mg/Nm3", name: "NH3"},
  { parameter: "pH", value: 'pH', name: 'ph' },
  { parameter: "Ammonical Nitrogen", value: 'mg/l', name: 'ammonicalNitrogen' },
  {parameter:"Totalizer_Flow", value:'m3/Day', name:'Totalizer_Flow'},



];


  return (
    <div>
    <div className="container-fluid">
        <div className="row" >
        <div className="col-lg-3 d-none d-lg-block ">
                        <DashboardSam />
                    </div>
       
          <div className="col-lg-9 col-12 ">
            <div className="row1 ">
              <div className="col-12  " >
              <div className="headermain">
        <Hedaer />
      </div>
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
                  
                </div>
              </div>
              <div className="maindashboard" >
              <Maindashboard/>
              </div>
            
            
     <div className="container-fluid water">
          <div className="row">
            
            <div className="col-lg-12 col-12">
            <h1 className={`text-center ${userData?.validUserOne?.userType === 'user' ? 'mt-5' : 'mt-3'}`}>
      Stack Emmission Dashboard
    </h1>
            
              
            {userData?.validUserOne?.userType === 'admin' && (
      <div className='d-flex justify-content-between prevnext '>
        <div>
          <button onClick={handlePrevUser} disabled={loading} className='btn btn-outline-dark mb-2 '>
            <i className="fa-solid fa-arrow-left me-1 "></i>Prev
          </button>
        </div>
      
    
        <div>
          <button onClick={handleNextUser} disabled={loading} className='btn btn-outline-dark '>
            Next <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    )}
            <div className="d-flex justify-content-between">
    
                  <ul className="quick-links ml-auto ">
                    <button className="btn  mb-2 mt-2 " style={{backgroundColor:'#236a80' , color:'white'}} onClick={() => setShowHistoryModal(true)}>
                      Daily History
                    </button>
                  </ul>
                  <ul className="quick-links ml-auto">
                  <h5 className='d-flex justify-content-end  '>
           <b>Analyser Health:</b><span className={searchResult?.validationStatus ? 'text-success' : 'text-danger'}>{searchResult?.validationStatus ? 'Good' : 'Problem'}</span></h5>
          
                  </ul>
    
                  {/* stac */}
    
                 
                 
            </div>
            <div className="d-flex justify-content-between">
            {userData?.validUserOne && userData.validUserOne.userType === 'user' && (
                    <ul className="quick-links ml-auto">
                      <button type="submit" onClick={handleOpenCalibrationPopup} className="btn  mb-2 mt-2" style={{backgroundColor:'#236a80' , color:'white'}}> Calibration </button>
                    </ul>
                  )}
                         <ul className="quick-links ml-auto">
                    {userData?.validUserOne && userData.validUserOne.userType === 'user' && (
                      <h5>Data Interval: <span className="span-class">{userData.validUserOne.dataInteval}</span></h5>
                    )}
                  </ul>
            </div>
            <div>
          <div className="row align-items-center">
          <div className="col-md-4">
          {searchResult?.stackData && searchResult.stackData.length > 0 && (
              <div className="stack-dropdown">
                <label htmlFor="stackSelect" className="label-select">Select Station:</label>
                <div className="styled-select-wrapper">
                  <select
                    id="stackSelect"
                    className="form-select styled-select"
                    value={selectedStack}
                    onChange={handleStackChange}
                  >
                    <option value="all">All Stacks</option>
                    {searchResult.stackData.map((stack, index) => (
                      <option key={index} value={stack.stackName}>
                        {stack.stackName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          </div>
          </div>
             
             
              {loading && (
                <div className="spinner-container">
                  <Oval
                    height={40}
                    width={40}
                    color="#236A80"
                    ariaLabel="Fetching details"
                    secondaryColor="#e0e0e0"
                    strokeWidth={2}
                    strokeWidthSecondary={2}
                  />
                </div>
              )}
    
             {/*  {!loading && searchError && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h1>{searchError}</h1>
                  </div>
                </div>
              )} */}
    <div className="col-12 d-flex justify-content-center align-items-center ">
    <h3 className="text-center">{companyName}</h3>
    
    </div>
    <div className="row">
      <div className="col-md-6">
      <div className="border bg-light shadow "  style={{ height: "70vh" , borderRadius:'15px'}} >
          {selectedCard ? (
              <WaterGraphPopup
                parameter={selectedCard.title}
                userName={currentUserName}
                stackName={selectedCard.stackName}
              />
            ) : (
              <h5 className="text-center mt-5">Select a parameter to view its graph</h5>
            )}
          </div>
      </div>
      <div className="col-md-6 border overflow-auto bg-light shadow" 
        style={{ height: "70vh", overflowY: "scroll",  borderRadius:'15px' }}>
      {!loading && filteredData.length > 0 ? (
                        filteredData.map((stack, stackIndex) => (
                          emissionStacks.includes(stack.stackName) && (
                                <div key={stackIndex} className="col-12 mb-4">
                                    <div className="stack-box">
                                        <h4 className="text-center mt-3">{stack.stackName} <img src={air} alt="stack image" width={'100px'} /></h4>
                                        <div className="row">
                                            {airParameters.map((item, index) => {
                                                const value = stack[item.name];
                                                return value && value !== 'N/A' ? (
                                                    <div className="col-12 col-md-4 grid-margin" key={index}>
                                                        <div className="card mb-4 stack-card" style={{border:'none' , color:'white'}}   onClick={() =>
                                handleCardClick({ title: item.name }, stack.stackName, currentUserName)
                              }>
                                                            <div className="card-body">
                                                                <h5 style={{color:'#ffff'}}>{item.parameter}</h5>
                                                                <p>
                                                                    <strong style={{ color: '#ffff', fontSize:'24px' }}>{value}</strong> {item.value}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        ))
                    ) : (
                      <div class="col-12 d-flex justify-content-center align-items-center mt-5">
                      <h5>Waiting real-time data available</h5>
                    </div>
                    )}
      </div>
    </div>
    
    
    
            {showCalibrationPopup && (
              <CalibrationPopup
                userName={userData?.validUserOne?.userName}
                onClose={handleCloseCalibrationPopup}
              />
            )}
          
    
            <DailyHistoryModal 
      isOpen={showHistoryModal} 
      onRequestClose={() => setShowHistoryModal(false)} 
    />
    
            </div>
          </div>
          <div>
        <CalibrationExceeded/>
      </div>
    
          <footer className="footer">
            <div className="container-fluid clearfix">
              <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
              
              </span>
              <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
                {" "}  Ebhoom Control and Monitor System <br />
                ©{" "}
                <a href="" target="_blank">
                  Ebhoom Solutions LLP
                </a>{" "}
                2023
              </span>
            </div>
          </footer>
        </div>
    
            </div>
          </div>
          <DailyHistoryModal
            isOpen={showHistoryModal}
            onRequestClose={() => setShowHistoryModal(false)}
            fetchData={fetchHistoryData}
            downloadData={downloadHistoryData}
          />
    
        </div>
        
    
        </div>
  );
};

export default Airambient;
