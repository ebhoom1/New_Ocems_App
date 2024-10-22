import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName  ,fetchLatestIotData } from "../../redux/features/iotData/iotDataSlice";
import AirGraphPopup from "./AirGraphPopup";
import CalibrationPopup from "../Calibration/CalibrationPopup";
import CalibrationExceeded from '../Calibration/CalibrationExceeded';
import { Oval } from 'react-loader-spinner';
import DashboardSam from '../Dashboard/DashboardSam';
import Maindashboard from "../Maindashboard/Maindashboard";
import Hedaer from "../Header/Hedaer";
import { API_URL } from "../../utils/apiConfig";
import DailyHistoryModal from "../Water/DailyHIstoryModal";


const Airambient = () => {
  const dispatch = useDispatch();
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
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
  
  
  // Fetch stack names and filter by emission-related station types
  const fetchEmissionStacks = async (userName) => {
    try {
      const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
      const data = await response.json(); // Parse response data
      const filteredStacks = data.stackNames
        .filter(stack => stack.stationType === 'emission')
        .map(stack => stack.name); // Extract only the stack names
      setEmissionStacks(filteredStacks);
    } catch (error) {
      console.error("Error fetching emission stacks:", error);
    }
  };

  const fetchData = async (userName) => {
    setLoading(true);
    try {
      const result = await dispatch(fetchIotDataByUserName(userName)).unwrap();
      setSearchResult(result);
      setCompanyName(result?.companyName || "Unknown Company");
      setSearchError("");
    } catch (err) {
      setSearchResult(null);
      setCompanyName("Unknown Company");
      setSearchError(err.message || 'No Result found for this userID');
    } finally {
      setLoading(false);
    }
  };


  const fetchHistoryData = async (fromDate, toDate) => {
    // Logic to fetch history data based on the date range
    console.log('Fetching data from:', fromDate, 'to:', toDate);
  };

  const downloadHistoryData = (fromDate, toDate) => {
    // Logic to download history data based on the date range
    console.log('Downloading data from:', fromDate, 'to:', toDate);
  };

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('selectedUserId');
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    fetchData(userName);
    fetchEmissionStacks(userName); // Fetch emission stacks
    if (storedUserId) {
      setCurrentUserName(storedUserId);
    }
  }, [selectedUserIdFromRedux, currentUserName, dispatch]);

  // Handle stack change
  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };
  const handleCardClick = (card) => {
    setSelectedCard(card);
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
/* stack */

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
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block ">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12 ">
          <div className="row">
            <div className="col-12">
              <Hedaer />
            </div>
          </div>
          <div className="maindashboard">
            <Maindashboard />
          </div>

          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-12 col-12">
              <h1 className={`text-center ${userData?.validUserOne?.userType === 'user' ? 'mt-5' : 'mt-3'}`}>
  Stack Emmission Dashboard
</h1>
              <div className={`d-flex justify-content-between prevnext mt-5`}>
  {userData?.validUserOne?.userType === 'admin' && (
    <div>
      <button onClick={handlePrevUser} disabled={loading} className='btn btn-outline-dark mt-3'>
        <i className="fa-solid fa-arrow-left me-1"></i>Prev
      </button>
    </div>
  )}

 

  {userData?.validUserOne?.userType === 'admin' && (
    <div>
      <button onClick={handleNextUser} disabled={loading} className='btn btn-outline-dark mt-3'>
        Next <i className="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  )}
</div>

                <div className="d-flex justify-content-between">
                <ul className="quick-links ml-auto mt-2">
                    <button className="btn mb-2 mt-2" style={{ backgroundColor: '#236a80', color: 'white' }} onClick={() => setShowHistoryModal(true)}>
                      Daily History
                    </button>
                  </ul>
                  
                 
                  <ul className="quick-links ml-auto">
                    <h5 className='d-flex justify-content-end mt-2'>
                      <b>Analyser Health:</b><span className={searchResult?.validationStatus ? 'text-success' : 'text-danger'}>
                        {searchResult?.validationStatus ? 'Good' : 'Problem'}
                      </span>
                    </h5>
                  </ul>
                </div>
                <div className="d-flex justify-content-between">
                  {userData?.validUserOne && userData.validUserOne.userType === 'user' && (
                    <ul className="quick-links ml-auto">
                      <button type="submit" onClick={handleOpenCalibrationPopup} className="btn mb-2 mt-2" style={{ backgroundColor: '#236a80', color: 'white' }}> Calibration </button>
                    </ul>
                  )}
                  <ul className="quick-links ml-auto">
                    {userData?.validUserOne && userData.validUserOne.userType === 'user' && (
                      <h5>Data Interval: <span className="span-class">{userData.validUserOne.dataInteval}</span></h5>
                    )}
                  </ul>


                </div>
                <div className="row align-items-center">
        <div className="col-md-4">
    {/* Dropdown for Stack Names */}
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
            <option value="all">All Stacks</option> {/* Default option to show all stacks */}
            {searchResult.stackData
                    .filter(stack => emissionStacks.includes(stack.stackName))
                    .map((stack, index) => (
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

                {!loading && searchError && (
                  <div className="card mb-4">
                    <div className="card-body">
                      <h1>{searchError}</h1>
                    </div>
                  </div>
                )}
{/*   {!loading && (!searchResult || !searchResult.stackData || searchResult.stackData.length === 0) && (
          <div className="col-12">
            <h5 className="text-center">No Data Available</h5>
          </div>
        )}
            */}     <div className="row">
                  <div className="col-12 col-md-12 grid-margin">
                    <div className="col-lg-9 col-12 airambient-section w-100">
                      <div className="content-wrapper shadow p-5">
                        <h3 className="text-center">{companyName}</h3>
                        <div className="row">
  {searchResult?.stackData && searchResult.stackData.length > 0 ? (
    searchResult.stackData
      .filter(stack => emissionStacks.includes(stack.stackName)) // Filter for emission-related stacks
      .map((stack, stackIndex) => (
        (selectedStack === "all" || selectedStack === stack.stackName) && (
          <div key={stackIndex} className="col-12 mb-4">
            <div className="stack-box">
              <h2 className="text-center" style={{ color: '#236a80' }}>
                <b>{stack.stackName}</b>
              </h2>
              <div className="row">
                {airParameters.map((item, index) => {
                  const value = stack[item.name];
                  return value && value !== 'N/A' ? (
                    <div className="col-12 col-md-4 grid-margin" key={index}>
                      <div className="card mb-3" onClick={() => handleCardClick({ title: item.parameter })}>
                        <div className="card-body">
                          <h3 className="mb-3">{item.parameter}</h3>
                          <h6>
                            <strong style={{ color: '#ffffff' }}>{value}</strong>
                            <span>{item.value}</span>
                          </h6>
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
    <div className="col-12">
      <h5 className="text-center">No Data Available</h5>
    </div>
  )}
</div>


                      


                        {showPopup && selectedCard && (
                          <AirGraphPopup
                            isOpen={showPopup}
                            onRequestClose={handleClosePopup}
                            parameter={selectedCard.title}
                            userName={currentUserName}
                          />
                        )}

                        {showCalibrationPopup && (
                          <CalibrationPopup
                            userName={userData?.validUserOne?.userName}
                            onClose={handleCloseCalibrationPopup}
                          />
                        )}
                        <div className="mt-2">  <CalibrationExceeded /></div>
                     
                      </div>
                    </div>
                  </div>
                </div>
               
                

                <footer className="footer">
                  <div className="container-fluid clearfix">
                    <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
                    
                    </span>
                    <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
                    Ebhoom Control and Monitor System <br />
                      {" "}©{" "}
                      <a href="" target="_blank">
                        Ebhoom Solutions LLP
                      </a>{" "}2023
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
    </div>
  );
};

export default Airambient;
