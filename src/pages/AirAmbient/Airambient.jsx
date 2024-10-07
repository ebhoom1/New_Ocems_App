import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import DashboardSam from '../Dashboard/DashboardSam';
import AirGraphPopup from './AirGraphPopup';
import CalibrationPopup from "../Calibration/CalibrationPopup";
import CalibrationExceeded from "../CalibartionPage/CalibrationExceeded";
import { Oval } from 'react-loader-spinner';
import Hedaer from "../Header/Hedaer";
import { useOutletContext } from 'react-router-dom';
import './Airgraph.css'; // Reusing the water.css for similar design
import waterDrop from '../../assests/images/windimage.png'
import Mainsam from "../Maindashboard/Mainsam";
import Maindashboard from "../Maindashboard/Maindashboard";
function Airambient() {
  const dispatch = useDispatch();
  const { searchTerm } = useOutletContext() || {};
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const { userData } = useSelector((state) => state.user);
  const { latestData, error } = useSelector((state) => state.iotData);

  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCalibrationPopup, setShowCalibrationPopup] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("KSPCB001");
  const [companyName, setCompanyName] = useState("");

  const airParameters = [
    { parameter: "Flow", value: 'm/s', name: "Flow" },
    { parameter: "CO", value: 'µg/Nm³', name: "CO" },
    { parameter: "NOX", value: 'µg/Nm³', name: "NOX" },
    { parameter: "Pressure", value: 'Pa', name: "Pressure" },
    { parameter: "PM", value: 'µg/m³', name: "PM" },
    { parameter: "SO2", value: 'µg/m³', name: "SO2" },
    { parameter: "NO2", value: 'µg/m³', name: "NO2" },
    { parameter: "Mercury", value: 'µg/m³', name: "Mercury" },
    { parameter: "PM 10", value: 'µg/m³', name: "PM10" },
    { parameter: "PM 2.5", value: 'µg/m³', name: "PM25" },
    { parameter: "NOH", value: 'µg/m³', name: "NOH" },
    { parameter: "NH3", value: 'µg/m³', name: "NH3" },
    { parameter: "Windspeed", value: 'm/s', name: "Windspeed" },
    { parameter: "Wind Dir", value: 'deg', name: "WindDir" },
    { parameter: "Temperature", value: '℃', name: "AirTemperature" },
    { parameter: "Humidity", value: '%', name: "Humidity" },
    { parameter: "Solar Radiation", value: 'w/m²', name: "solarRadiation" }
  ];

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
    const storedUserId = sessionStorage.getItem('selectedUserId');
    const userName = searchTerm || storedUserId || selectedUserIdFromRedux || currentUserName;
    fetchData(userName);

    if (storedUserId) {
      setCurrentUserName(storedUserId);
    }
  }, [selectedUserIdFromRedux, searchTerm, currentUserName, dispatch]);

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
      sessionStorage.setItem('selectedUserId', newUserId);
      fetchData(newUserId);
    }
  };

  const handlePrevUser = () => {
    const userIdNumber = parseInt(currentUserName.replace(/[^\d]/g, ''), 10);
    if (!isNaN(userIdNumber) && userIdNumber > 1) {
      const newUserId = `KSPCB${String(userIdNumber - 1).padStart(3, '0')}`;
      setCurrentUserName(newUserId);
      sessionStorage.setItem('selectedUserId', newUserId);
      fetchData(newUserId);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block ">
          <DashboardSam />
        </div>

        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <Hedaer />
             
            </div>
          </div>
         <div className="maindashboard">
         <Maindashboard/>
         </div>

          <div className="d-flex justify-content-between prevnext mt-5 ps-5 pe-5">
            <div>
              <button 
                className='btn btn-outline-dark' 
                onClick={handlePrevUser} 
                disabled={loading || currentUserName === "KSPCB001"}
              >
                <i className="fa-solid fa-arrow-left me-1"></i>Prev
              </button>
            </div>
            <h1 className='text-center'>Air Dashboard</h1>
            <div>
              <button 
                className='btn btn-outline-dark' 
                onClick={handleNextUser} 
                disabled={loading}
              >
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
                <button 
                  type="submit" 
                  onClick={handleOpenCalibrationPopup} 
                  className="btn mb-2 mt-2" 
                  style={{ backgroundColor: '#236a80', color: 'white' }}
                >
                  Calibration
                </button>
              </ul>
            )}
          </div>

          <div><h5 className='d-flex justify-content-end me-5 mt-3'>
            <b>Analyser Health :</b> <span className={searchResult?.validationStatus ? 'text-success' : 'text-danger'}>
              {searchResult?.validationStatus ? 'Good' : 'Problem'}
            </span>
          </h5></div>
         {/*  {userData?.validUserOne && userData.validUserOne.userType === 'user' && (
                <ul className="quick-links ml-auto">
                  <button type="submit" onClick={handleOpenCalibrationPopup} className="btn btn-primary mb-2 mt-2"> Calibration </button>
                </ul>
              )} */}

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
<h3 className="text-center">{companyName}</h3>
<div className="row">
  {airParameters.some(item => searchResult && searchResult[item.name]) ? (
    // If there are valid parameters, display the cards
    airParameters
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
                  <CalibrationExceeded />


        </div>
      </div>

      <footer className="footer">
        <div className="container-fluid clearfix">
          <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
           
          </span>
          <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
          AquaBox Control and Monitor System <br />
            {" "}
            ©{" "}
            <a href="" target="_blank">
              EnviRobotics
            </a>{" "}
            2022
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Airambient;
