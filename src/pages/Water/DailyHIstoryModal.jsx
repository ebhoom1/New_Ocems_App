import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Oval } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { API_URL } from '../../utils/apiConfig';
import { fetchStackNameByUserName } from '../../redux/features/userLog/userLogSlice';
import './index.css';

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: 'fit-content',
    height: '500px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
};

const DailyHistoryModal = ({ isOpen, onRequestClose }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [userName, setUserName] = useState('');
  const [stackName, setStackName] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [stackOptions, setStackOptions] = useState([]);
  const [subscriptionDate, setSubscriptionDate] = useState('');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const navigate = useNavigate();
  const { userType, userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userType === 'admin') {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/getallusers`);
          const filteredUsers = response.data.users.filter((user) => user.userType === 'user');
          setUsers(filteredUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      fetchUsers();
    } else if (userType === 'user' && userData?.validUserOne?.userName) {
      const loggedUserName = userData.validUserOne.userName;
      setUserName(loggedUserName);
      setSubscriptionDate(userData.validUserOne.subscriptionDate);
  
      // Automatically fetch stack names for the logged-in user
      handleUserChange({ userName: loggedUserName });
    }
  }, [userType, userData]);
  

  const handleUserChange = async (selectedUser) => {
    setUserName(selectedUser.userName);
    setSubscriptionDate(selectedUser.subscriptionDate);
  
    try {
      const result = await dispatch(fetchStackNameByUserName(selectedUser.userName)).unwrap();
      
      // Ensure we map the stack names to an array of strings
      const stackNames = result.map((stack) => stack.name); 
      setStackOptions(stackNames);
    } catch (error) {
      console.error('Error fetching stack names:', error);
      alert('Failed to fetch stack names for the selected user.');
    }
  };
  
  const handleViewClick = async () => {
    if (fromDate && toDate && userName && stackName) {
      const isSameDate = moment(fromDate).isSame(moment(toDate), 'day');

      if (isSameDate) {
        alert('Both From Date and To Date must be different to view the data. Use the same dates for download.');
        return;
      }

      const dateDifference = moment(toDate).diff(moment(fromDate), 'days');
      if (dateDifference > 7) {
        alert("You can view only one week's data. Please use download for larger ranges.");
        return;
      }

      setLoading(true);
      try {
        const formattedFromDate = moment(fromDate).format('DD-MM-YYYY');
        const formattedToDate = moment(toDate).format('DD-MM-YYYY');
        const response = await axios.get(`${API_URL}/api/view-data-by-date-user-stack`, {
          params: { fromDate: formattedFromDate, toDate: formattedToDate, userName, stackName },
        });
        const data = response.data.data;
        setLoading(false);
        navigate('/view-data', { state: { data, fromDate: formattedFromDate, toDate: formattedToDate } });
      } catch (error) {
        setLoading(false);
        console.error('Error fetching data:', error);
        alert('Failed to fetch data.');
      }
    }
  };

  const handleDownloadClick = async (selectedFormat) => {
    if (!fromDate || !toDate || !userName || !stackName) {
      alert('Please fill in all fields');
      return;
    }

    const formattedFromDate = moment(fromDate).format('DD-MM-YYYY');
    const formattedToDate = moment(toDate).format('DD-MM-YYYY');

    try {
      const response = await axios.get(`${API_URL}/api/downloadIotDataByUserNameAndStackName`, {
        params: { fromDate: formattedFromDate, toDate: formattedToDate, userName, stackName, format: selectedFormat },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `iot_data_${formattedFromDate}_to_${formattedToDate}.${selectedFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download data.');
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <div className="modal-header">
        <h5 className="modal-title">Select Date Range</h5>
        <button type="button" className="close" onClick={onRequestClose}>
          &times;
        </button>
      </div>
      <div className="modal-body">
        {userType === 'admin' ? (
          <div className="form-group">
            <label>User Name</label>
            <select
              className="form-control"
              value={userName}
              onChange={(e) => handleUserChange(users.find(user => user.userName === e.target.value))}
            >
              <option value="">Select</option>
              {users.map((user) => (
                <option key={user.userName} value={user.userName}>
                  {user.userName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="form-group">
            <label>User Name:</label>
            <input type="text" className="form-control" value={userName} readOnly />
          </div>
        )}
        <div className="form-group">
          <label>Station Name</label>
          <select
  className="form-control"
  value={stackName}
  onChange={(e) => setStackName(e.target.value)}
  disabled={!stackOptions.length}
>
  <option value="">Select</option>
  {stackOptions.map((stack, index) => (
    <option key={index} value={stack}>
      {stack}
    </option>
  ))}
</select>


        </div>
        <div className="form-group">
          <label>From Date (Subscription Date: {moment(subscriptionDate).format('DD-MM-YYYY')}):</label>
          <input
            type="date"
            className="form-control"
            value={fromDate}
            min={subscriptionDate ? moment(subscriptionDate).format('YYYY-MM-DD') : undefined}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>To Date:</label>
          <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>
      <div className="modal-footer">
        <div className="btn-group">
          <button
            className="btn btn-success dropdown-toggle"
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            disabled={!fromDate || !toDate || !userName || !stackName}
          >
            Download
          </button>
          {showDownloadOptions && (
            <div className="dropdown-menu show">
              <button className="dropdown-item" onClick={() => handleDownloadClick('csv')}>
                Download as CSV
              </button>
              <button className="dropdown-item" onClick={() => handleDownloadClick('pdf')}>
                Download as PDF
              </button>
            </div>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleViewClick}
          disabled={loading || !fromDate || !toDate || !userName || !stackName}
        >
          {loading ? <Oval height={20} width={20} color="#fff" secondaryColor="#ddd" /> : 'View'}
        </button>
      </div>
    </Modal>
  );
};

export default DailyHistoryModal;