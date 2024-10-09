import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Oval } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { API_URL } from '../../utils/apiConfig';
import './index.css'

Modal.setAppElement('#root'); // Properly set the app element for accessibility

const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: 'fit-content',
      height: '440px',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '10px',
      zIndex: 9999,  // Make sure modal is on top of everything
      position: 'fixed',  // Ensure it stays fixed in the viewport
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Darken the background
      zIndex: 9998,  // Make sure overlay is just below the modal content
    },
  };

const DailyHistoryModal = ({ isOpen, onRequestClose }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [subscriptionDate, setSubscriptionDate] = useState('');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const navigate = useNavigate();
  const { userType, userData } = useSelector((state) => state.user);

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
      setUserName(userData.validUserOne.userName);
      setSubscriptionDate(userData.validUserOne.subscriptionDate);  // Set the subscription date for the user
    }
  }, [userType, userData]);

  const handleUserChange = (selectedUser) => {
    setUserName(selectedUser.userName);
    setSubscriptionDate(selectedUser.subscriptionDate);  // Set the subscription date for the selected user (admin case)
  };

  const handleViewClick = async () => {
    if (fromDate && toDate && userName) {
      const isSameDate = moment(fromDate).isSame(moment(toDate), 'day');

      // Check if both dates are the same for the view functionality
      if (isSameDate) {
        alert("Both From Date and To Date must be different to view the data. You can use the same dates for downloading.");
        return; // Exit if trying to view data with same dates
      }

      // Check if the date range exceeds 7 days
      const dateDifference = moment(toDate).diff(moment(fromDate), 'days');
      if (dateDifference > 7) {
        alert("You can view only one week's data. If you want to see more, please use the download option.");
        return; // Exit if the date range is more than 7 days
      }

      setLoading(true);
      try {
        const formattedFromDate = moment(fromDate).format('DD-MM-YYYY');
        const formattedToDate = moment(toDate).format('DD-MM-YYYY');
        const response = await axios.get(`${API_URL}/api/view-data-by-date-user`, {
          params: { fromDate: formattedFromDate, toDate: formattedToDate, userName },
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
    if (!fromDate || !toDate || !userName) {
      alert('Please fill in all fields');
      return;
    }

    const formattedFromDate = moment(fromDate).format('DD-MM-YYYY');
    const formattedToDate = moment(toDate).format('DD-MM-YYYY');
    const fileFormat = selectedFormat;

    try {
      const response = await axios.get(`${API_URL}/api/downloadIotDataByUserName`, {
        params: { fromDate: formattedFromDate, toDate: formattedToDate, userName, format: fileFormat },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `iot_data_${formattedFromDate}_to_${formattedToDate}.${fileFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download data');
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <div className="modal-header d-flex justify-content-between">
        <h5 className="modal-title">Select Date Range</h5>
        <button type="button" className="closebtn" onClick={onRequestClose}>
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
            <input
              type="text"
              className="form-control"
              value={userName}
              readOnly
            />
          </div>
        )}
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
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>
      <div className="modal-footer mt-2">
        <div className="btn-group ">
          <button
            className="btn btn-success dropdown-toggle me-2"
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            disabled={!fromDate || !toDate || !userName}
          >
            Download
          </button>
          {showDownloadOptions && (
            <div className="dropdown-menu show">
              <button
                className="dropdown-item"
                onClick={() => handleDownloadClick('csv')}
              >
                Download as CSV
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleDownloadClick('pdf')}
              >
                Download as PDF
              </button>
            </div>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleViewClick}
          disabled={loading || !fromDate || !toDate || !userName}
        >
          {loading ? <Oval height={20} width={20} color="#fff" secondaryColor="#ddd" /> : 'View'}
        </button>
      </div>
    </Modal>
  );
};

export default DailyHistoryModal;