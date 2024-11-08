import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import { fetchUserLatestByUserName } from "../../redux/features/userLog/userLogSlice";
import TotalSewageGraph from '../Water/WaterGraphPopup';
import CalibrationPopup from '../Calibration/CalibrationPopup';
import CalibrationExceeded from '../Calibration/CalibrationExceeded';
import { useOutletContext } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import DailyHistoryModal from "../Water/DailyHIstoryModal"; 
import { API_URL } from "../../utils/apiConfig";
import { io } from 'socket.io-client';

// Initialize Socket.IO
const socket = io(API_URL, { 
  transports: ['websocket'], 
  reconnectionAttempts: 5,
  reconnectionDelay: 1000, // Retry every second
});

socket.on('connect', () => console.log('Connected to Socket.IO server'));
socket.on('connect_error', (error) => console.error('Connection Error:', error));

function QuantityFlow() {
    const dispatch = useDispatch();
    const { userId } = useSelector((state) => state.selectedUser); 

    const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
    const storedUserId = sessionStorage.getItem('selectedUserId'); // Retrieve userId from session storage
    const { userData, userType } = useSelector((state) => state.user);
    const { latestData, error } = useSelector((state) => state.iotData);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showCalibrationPopup, setShowCalibrationPopup] = useState(false);
    const { searchTerm } = useOutletContext();
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState("");
    const [currentUserName, setCurrentUserName] = useState(userType === 'admin' ? "KSPCB001" : userData?.validUserOne?.userName);
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedStack, setSelectedStack] = useState("all");
    const [effluentFlowStacks, setEffluentFlowStacks] = useState([]); // New state to store effluentFlow stacks
    const [realTimeData, setRealTimeData] = useState({});
  
    // Fetch stack names and filter effluentFlow stationType stacks
    const fetchEffluentFlowStacks = async (userName) => {
      try {
        const response = await fetch(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
        const data = await response.json(); // Make sure to parse the JSON
        const effluentFlowStacks = data.stackNames
          .filter(stack => stack.stationType === 'effluent_flow')
          .map(stack => stack.name); // Use 'name' instead of 'stackName'
        setEffluentFlowStacks(effluentFlowStacks);
      } catch (error) {
        console.error("Error fetching effluentFlow stacks:", error);
      }
    };
    
  
    const fetchData = async (userName) => {
      setLoading(true);
      try {
        const result = await dispatch(fetchUserLatestByUserName(userName)).unwrap();
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
        const storedUserId = sessionStorage.getItem('selectedUserId');
        const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
        console.log(`username : ${userName}`);
        
        fetchData(userName);
        fetchEffluentFlowStacks(userName); // Fetch emission stacks
        if (storedUserId) {
          setCurrentUserName(storedUserId);
        }
      }, [selectedUserIdFromRedux, currentUserName, dispatch]);
    
      /* useEffect(() => {
        const userName = storedUserId || currentUserName;
        console.log(`username:${userName}`)
        fetchData(userName);
        setCurrentUserName(userName); 
        fetchEffluentStacks(userName);
      }, [searchTerm, currentUserName]);
     */
      useEffect(() => {
        if (searchTerm) {
          fetchData(searchTerm);
          fetchEffluentFlowStacks(searchTerm); // Fetch effluent stacks
        } else {
          fetchData(currentUserName);
          fetchEffluentFlowStacks(currentUserName); // Fetch effluent stacks
        }
      }, [searchTerm, currentUserName, dispatch]);
    
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
      
    
      
    
      // Handle card click for displaying graphs
      const handleCardClick = (card, stackName) => {
        // Ensure we use the correct userName when admin searches for a user.
        const userName = searchTerm || currentUserName;
        setSelectedCard({ ...card, stackName, userName });
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
    
      const filteredData = selectedStack === "all"
        ? Object.values(realTimeData)
        : Object.values(realTimeData).filter(data => data.stackName === selectedStack);
        
        const effluentFlowParameters = [
            { parameter: "inFlow", value: "m³", name: "inflow" },
            { parameter: "Out Flow", value: "m³", name: "finalflow" },
           
          ];
  return (
    <div className="main-panel">
      <div className="content-wrapper bg-light">
       {/*  <div className="row page-title-header">
          <div className="col-12">
            
          </div>
        </div> */}
        
        <div className="row align-items-center mb-4 ">
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
          {searchResult.stackData
            .filter(stack => effluentFlowStacks.includes(stack.stackName)) // Filter only energy stations
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
  {/* Graph Column */}
  <div className="col-5">
    <div className="border  shadow" style={{ height: "70vh"  , backgroundColor:'#ffff'}}>
      {selectedCard ? (
        <TotalSewageGraph
          isOpen={showPopup}
          onRequestClose={handleClosePopup}
          parameter={selectedCard.title}
          userName={currentUserName}
          stackName={selectedCard.stackName}
        />
      ) : (
        <h5 className="text-center">Select a parameter to view its graph</h5>
      )}
    </div>
  </div>

  {/* Data Column */}
  <div className="col-7 overflow-auto border shadow" style={{ height: "70vh"  , backgroundColor:'#ffff' }}>
    <div className="row">
      {!loading && filteredData.length > 0 ? (
        filteredData.map((stack, stackIndex) => (
          effluentFlowStacks.includes(stack.stackName) && (
            <div key={stackIndex} className="col-12 mb-4">
              <div className="stack-box">
                <h4 className="text-center">{stack.stackName}</h4>
                <div className="row">
                  {effluentFlowParameters.map((item, index) => {
                    const value = stack[item.name];
                    return value && value !== "N/A" ? (
                      <div className="col-6 col-md-4 grid-margin" key={index}>
                        <div
                          className="card"
                          onClick={() =>
                            handleCardClick(
                              { title: item.name },
                              stack.stackName,
                              currentUserName
                            )
                          }
                        >
                          <div className="card-body">
                            <h5>{item.parameter}</h5>
                            <p>
                              <strong
                                style={{ color: "#236A80", fontSize: "24px" }}
                              >
                                {value}
                              </strong>{" "}
                              {item.value}
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
        <div className="col-12 d-flex justify-content-center align-items-center mt-5">
          <h5>Waiting real-time data available</h5>
        </div>
      )}
    </div>
  </div>
</div>


       

       
      
    

        <DailyHistoryModal 
  isOpen={showHistoryModal} 
  onRequestClose={() => setShowHistoryModal(false)} 
/>

      </div>
    </div>
  )
}

export default QuantityFlow