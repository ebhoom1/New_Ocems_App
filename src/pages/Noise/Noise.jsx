import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import NoiseGraphPopup from './NoiseGraphPopup';
import CalibrationPopup from '../Calibration/CalibrationPopup';
import CalibrationExceeded from '../Calibration/CalibrationExceeded';
import { useOutletContext } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import Maindashboard from '../Maindashboard/Maindashboard';
import DailyHistoryModal from '../Water/DailyHIstoryModal';

const Noise = () => {
  const outletContext = useOutletContext() || {};
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const { searchTerm = '' } = outletContext;
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { latestData } = useSelector((state) => state.iotData);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCalibrationPopup, setShowCalibrationPopup] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [currentUserName, setCurrentUserName] = useState("KSPCB001");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStack, setSelectedStack] = useState("all");
  const fetchUserData = async (userName) => {
    setLoading(true);
    try {
      const result = await dispatch(fetchIotDataByUserName(userName)).unwrap();
      setSearchResult(result);
      setCompanyName(result?.companyName || "Unknown Company");
      setSearchError("");
      setCurrentUserName(userName); 
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
    const userName = searchTerm || storedUserId || selectedUserIdFromRedux || currentUserName;
    fetchUserData(userName);

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
      fetchUserData(newUserId);
    }
  };

  const handlePrevUser = () => {
    const userIdNumber = parseInt(currentUserName.replace(/[^\d]/g, ''), 10);
    if (!isNaN(userIdNumber) && userIdNumber > 1) {
      const newUserId = `KSPCB${String(userIdNumber - 1).padStart(3, '0')}`;
      fetchUserData(newUserId);
    }
  };
/* stack */
const handleStackChange = (event) => {
  setSelectedStack(event.target.value);
};


const noiseParameters = [
  { parameter: "Noise Level", value: 'dB', name: 'DB' },  // Ensure name matches "DB"
];

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <Hedaer />
            </div>
          </div>
        <div className='maindashboard'>
        <Maindashboard/>
        </div>

          <div className="d-flex justify-content-between prevnext mt-5 ps-5 pe-5">
            <div>
              <button className='btn btn-outline-dark' onClick={handlePrevUser} disabled={loading}>
                <i className="fa-solid fa-arrow-left me-1"></i>Prev
              </button>
            </div>
            <h2 className='text-center'>NOISE DASHBOARD</h2>
            <div>
              <button className='btn btn-outline-dark' onClick={handleNextUser} disabled={loading}>
                Next <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <h3 className="text-center">{companyName}</h3>
            </div>
          </div>

       
          <div className="d-flex justify-content-between">
                <ul className="quick-links ml-auto mt-2">
                    <button className="btn mb-2 mt-2" style={{ backgroundColor: '#236a80', color: 'white' }} onClick={() => setShowHistoryModal(true)}>
                      Daily History
                    </button>
                  </ul>
                  
                 
                 
                  <ul className="quick-links ml-auto">
                {latestData && (
                  <>
                      <h5 className='d-flex justify-content-end mt-2'>
                      <b>Analyser Health:</b><span className={searchResult?.validationStatus ? 'text-success' : 'text-danger'}>
                        {searchResult?.validationStatus ? 'Good' : 'Problem'}
                      </span>
                    </h5>
                  </>
                )}
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

         

          {searchError && (
            <div className="card mb-4">
              <div className="card-body">
                <h1>{searchError}</h1>
              </div>
            </div>
          )}
 {loading && (
          <div className="spinner-container">
            <Oval
              height={60}
              width={60}
              color="#236A80"
              ariaLabel="Fetching details"
              secondaryColor="#e0e0e0"
              strokeWidth={2}
              strokeWidthSecondary={2}
            />
          </div>
        )}
          <div className="row">
          {!loading && searchResult && searchResult.stackData && (
            <>
              {searchResult.stackData.map((stack, stackIndex) => (
                (selectedStack === "all" || selectedStack === stack.stackName) && (
                  <div key={stackIndex} className="col-12 mb-4">
                    <div className="stack-box mt-2">
                      <h2 className="text-center" style={{color:'#236a80'}}><b>{stack.stackName}</b></h2>
                      <div className="row">
                        {noiseParameters.map((item, index) => {
                          const value = stack[item.name];
                          return value && value !== 'N/A' ? (
                            <div className="col-12 col-md-4 grid-margin" key={index}>
                              <div className="card" onClick={() => handleCardClick({ title: item.parameter })}>
                                <div className="card-body">
                                  <div className="row">
                                    <div className="col-12">
                                      <h3 className="mb-3">{item.parameter}</h3>
                                    </div>
                                    <div className="col-12 mb-3">
                                      <h6>
                                        <strong className="strong-value" style={{ color: '#236A80' }}>
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
          )}
        </div>
            

          {showPopup && selectedCard && (
            <NoiseGraphPopup
              isOpen={showPopup}
              onRequestClose={handleClosePopup}
              parameter={selectedCard.title}
              userName={currentUserName}
            />
          )}

          {showCalibrationPopup && (
            <CalibrationPopup onClose={handleCloseCalibrationPopup} />
          )}

          <CalibrationExceeded />
        </div>
      </div>

      <footer className="footer">
        <div className="container-fluid clearfix text-center mt-3">
          <span className="d-block text-center text-sm-left d-sm-inline-block">
            Copyright ©2023{" "}
            <a href="https://ebhoom.com" target="_blank" rel="noopener noreferrer">
              Ebhoom
            </a>
            . All rights reserved
          </span>
        </div>
      </footer>
      <DailyHistoryModal
          isOpen={showHistoryModal}
          onRequestClose={() => setShowHistoryModal(false)}
          fetchData={fetchUserData}
          downloadData={() => {}}
        />
    </div>
  );
};

export default Noise;
