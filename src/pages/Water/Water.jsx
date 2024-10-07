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

const Water = () => {
  // Use useOutletContext if available, otherwise set defaults
  const outletContext = useOutletContext() || {};
  const { userId } = useSelector((state) => state.selectedUser); 
  const { searchTerm = '', searchStatus = '', handleSearch = () => {}, isSearchTriggered = false } = outletContext;

  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { latestData, error } = useSelector((state) => state.iotData);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCalibrationPopup, setShowCalibrationPopup] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState("KSPCB001");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  // Water parameters
  const waterParameters = [
    { parameter: "Ph", value: 'pH', name: 'ph' },
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
    { parameter: "Chloride", value: 'mmol/l', name: 'chloride' },
    { parameter: "Colour", value: 'color', name: 'color' },
  ];

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
     
    } else {
      fetchData(currentUserName);
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
          
          <div className='d-flex justify-content-between prevnext mt-5 ps-5 pe-5'>
            <div>
              <button onClick={handlePrevUser} disabled={loading} className='btn btn-outline-dark'>
                <i className="fa-solid fa-arrow-left me-1"></i>Prev
              </button>
            </div>
            <h1 className='text-center'>Water Dashboard</h1>
            <div>
              <button onClick={handleNextUser}
               disabled={loading} className='btn btn-outline-dark'>
                Next <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        <div className="d-flex justify-content-between">
        <ul className="quick-links ml-auto">
                {userData?.validUserOne && userData.validUserOne.userType === 'user' && (
                  <h5>Data Interval: <span className="span-class">{userData.validUserOne.dataInteval}</span></h5>
                )}
              </ul>
              {userData?.validUserOne && userData.validUserOne.userType === 'user' && (
                <ul className="quick-links ml-auto">
                  <button type="submit" onClick={handleOpenCalibrationPopup} className="btn  mb-2 mt-2" style={{backgroundColor:'#236a80' , color:'white'}}> Calibration </button>
                </ul>
              )}
        </div>
          <div><h5 className='d-flex justify-content-end me-5 mt-3'>
          <b>Analyser Health :</b> <span className={searchResult?.validationStatus ? 'text-success' : 'text-danger'}>{searchResult?.validationStatus ? 'Good' : 'Problem'}</span></h5>
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
  {waterParameters.some(item => searchResult && searchResult[item.name]) ? (
    // If there are valid parameters, display the cards
    waterParameters
      .filter(item => searchResult && searchResult[item.name]) // Filter parameters with valid data
      .map((item, index) => (
        <div className="col-md-4 col-12 grid-margin" key={index}>
          <div className="card m-3" onClick={() => handleCardClick(item)}>
            <div className="card-body">
              <h3 className="mb-3">{item.parameter}</h3>
              <h6>
                <strong className="strong-value">
                  {searchResult[item.name] || 'N/A'}
                </strong>
                {item.value}
              </h6>
              <div className="image-container">
                <img src={waterDrop} alt="Water Drop" className="img-fluid custom-img" />
              </div>
            </div>
          </div>
        </div>
      ))
  ) : (
    // If no valid parameters, show 'No Data Found' message
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
            Ebhoom Control and Monitor System
          </span>
          <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
            {" "}
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


    
    </div>
  );
};

export default Water;
