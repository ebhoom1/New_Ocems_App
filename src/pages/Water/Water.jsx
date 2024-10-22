import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import Maindashboard from '../Maindashboard/Maindashboard';
import DashboardSam from '../Dashboard/DashboardSam';
import WaterGraphPopup from './WaterGraphPopup';
import CalibrationPopup from '../Calibration/CalibrationPopup';
import CalibrationExceeded from "../CalibartionPage/CalibrationExceeded";
import { Oval } from 'react-loader-spinner';
import { useOutletContext } from 'react-router-dom';
import './water.css';
import waterDrop from '../../assests/images/water.png';
import Layout from "../Layout/Layout";
import Hedaer from "../Header/Hedaer";
import DailyHistoryModal from "./DailyHIstoryModal";
import { API_URL } from "../../utils/apiConfig";

const Water = () => {
  // Use useOutletContext if available, otherwise set defaults
  const outletContext = useOutletContext() || {};
  const { userId } = useSelector((state) => state.selectedUser); 
  const { searchTerm = '', searchStatus = '', handleSearch = () => {}, isSearchTriggered = false } = outletContext;

  const dispatch = useDispatch();
  const { userData,userType } = useSelector((state) => state.user);
  const { latestData, error } = useSelector((state) => state.iotData);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCalibrationPopup, setShowCalibrationPopup] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState(userType === 'admin' ? "KSPCB001" : userData?.validUserOne?.userName);  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState("all");
  const [effluentStacks, setEffluentStacks] = useState([]); // New state to store effluent stacks
  // Water parameters
  const waterParameters = [
    { parameter: "pH", value: 'pH', name: 'ph' },
    { parameter: "TDS", value: 'mg/l', name: 'TDS' },
    { parameter: "Turbidity", value: 'NTU', name: 'turbidity' },
    { parameter: "Temperature", value: '℃', name: 'temperature' },
    { parameter: "BOD", value: 'mg/l', name: 'BOD' },
    { parameter: "COD", value: 'mg/l', name: 'COD' },
    { parameter: "TSS", value: 'mg/l', name: 'TSS' },
    { parameter: "ORP", value: 'mV', name: 'ORP' },
    { parameter: "Nitrate", value: 'mg/l', name: 'nitrate' },
    { parameter: "Ammonical Nitrogen", value: 'mg/l', name: 'ammonicalNitrogen' },
    { parameter: "DO", value: 'mg/l', name: 'DO' },
    {parameter:"Totalizer_Flow", value:'m3/Day', name:'Totalizer_Flow'},
    { parameter: "Chloride", value: 'mmol/l', name: 'chloride' },
    { parameter: "Colour", value: 'color', name: 'color' },
    { parameter: "Fluoride", value: "mg/Nm3", name: "Fluoride" },
    { parameter: "Flow", value: 'm3/hr', name: "Flow" },

  ];
 // Fetch stack names and filter effluent stationType stacks
  const fetchEffluentStacks = async (userName) => {
    try {
      const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
      const data = await response.json(); // Make sure to parse the JSON
      const effluentStacks = data.stackNames
        .filter(stack => stack.stationType === 'effluent')
        .map(stack => stack.name); // Use 'name' instead of 'stackName'
      setEffluentStacks(effluentStacks);
    } catch (error) {
      console.error("Error fetching effluent stacks:", error);
    }
  };
  // Fetching data by username
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
    // Example API call:
    // const data = await dispatch(fetchHistoryDataByDate({ fromDate, toDate })).unwrap();
  };
  const downloadHistoryData = (fromDate, toDate) => {
    // Logic to download history data based on the date range
    console.log('Downloading data from:', fromDate, 'to:', toDate);
    // Example API call:
    // downloadData({ fromDate, toDate });
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
  useEffect(() => {
    // Use selected userId from Redux or default to the current one
    if (userId) {
      fetchData(userId);
    } else {
      fetchData(currentUserName);
    }
  }, [userId, currentUserName, dispatch]);
  /*  */
  useEffect(() => {
    if (searchTerm) {
      fetchData(searchTerm);
      fetchEffluentStacks(searchTerm); // Fetch effluent stacks
    } else {
      fetchData(currentUserName);
      fetchEffluentStacks(currentUserName); // Fetch effluent stacks
    }
  }, [searchTerm, currentUserName, dispatch]);

  // Handle card click for displaying graphs
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

  // Pagination to handle user navigation
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
  const handleStackChange = (event) => {
    setSelectedStack(event.target.value);
  };
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
  Effluent Dashboard
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
        <div><div className="row align-items-center">
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
          </div></div>
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

          <div className="row" >
            <div className="col-12 col-md-12 grid-margin">
              <div className="col-12 d-flex justify-content-between align-items-center m-3"></div>
              <div className="col-lg-9 col-12 airambient-section w-100">
                <div className="content-wrapper shadow p-5">
                  <h3 className="text-center">{companyName}</h3>
                  
                  <div className="row">
  {!loading && searchResult && searchResult.stackData ? (
    <>
      {/* Render Stack Data */}
      {searchResult.stackData.map((stack, stackIndex) => (
              (selectedStack === "all" || selectedStack === stack.stackName) &&
              effluentStacks.includes(stack.stackName) && ( // Filter by effluent stacks
                <div key={stackIndex} className="col-12 mb-4">
                  <div className="stack-box">
                    <h4 className="text-center">{stack.stackName}</h4>
                    <div className="row">
                      {waterParameters.map((item, index) => {
                        const value = stack[item.name];
                        return value && value !== 'N/A' ? (
                          <div className="col-12 col-md-4 grid-margin mb-3" key={index}>
                            <div className="card" onClick={() => handleCardClick({ title: item.parameter })}>
                              <div className="card-body">
                                <div className="row">
                                  <div className="col-12">
                                    <h3 className="mb-5">{item.parameter}</h3>
                                  </div>
                                  <div className="col-12 mb-3">
                                    <h6>
                                      <strong className="strong-value" style={{ color: '#ffff' }}>
                                        {value}
                                      </strong>
                                      <span>{item.value}</span>
                                    </h6>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )
            ))}
    </>
  ) : (
    // If no valid parameters or data, show 'No Data Found' message
    <h1 className="text-center mt-5">No Data Found</h1>
  )}
</div>




                
                  {showPopup && selectedCard && (
                    <WaterGraphPopup
                      show={showPopup}
                      handleClose={handleClosePopup}
                      parameter={selectedCard.parameter}
                      userName={currentUserName}
                    />
                  )}

                 
                  {showCalibrationPopup && (
                    <CalibrationPopup
                      userName={userData?.validUserOne?.userName}
                      onClose={handleCloseCalibrationPopup}
                    />
                  )}
                  
                  <CalibrationExceeded />
                </div>
              </div>
            </div>
          </div>
        </div>
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
    </div>
    <DailyHistoryModal
        isOpen={showHistoryModal}
        onRequestClose={() => setShowHistoryModal(false)}
        fetchData={fetchHistoryData}
        downloadData={downloadHistoryData}
      />


    
    </div>
  );
};

export default Water;
