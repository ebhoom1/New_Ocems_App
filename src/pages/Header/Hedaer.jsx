import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIotDataByUserName } from './../../redux/features/iotData/iotDataSlice';
import { fetchUser, logoutUser } from './../../redux/features/user/userSlice';
import { setSelectedUser } from '../../redux/features/selectedUsers/selectedUserSlice'; 

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Dropdown from 'react-bootstrap/Dropdown';
import DashboardSam from '../Dashboard/DashboardSam';
import axios from 'axios';
import './header.css';
import { API_URL } from '../../utils/apiConfig';
import { useOutletContext } from 'react-router-dom';
import { useRef } from 'react';

function Hedaer() {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpenNotification, setIsDropdownOpenNotification] = useState(false);
  const [userName, setUserName] = useState(""); // State for the selected user name
  const [users, setUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [dropdownAlignment, setDropdownAlignment] = useState('end');

  const handleDropdownClick = () => {
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - dropdownRect.right;
    const neededSpace = 300; // Approx width of your dropdown menu
    if (spaceOnRight < neededSpace) {
      setDropdownAlignment('start');
    } else {
      setDropdownAlignment('end');
    }
  };

  const selectedUserId = useSelector((state) => state.selectedUser.userId);
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSignOut = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/getallusers`);
        const filteredUsers = response.data.users.filter(user => user.userType === "user");
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const validateUser = async () => {
      try {
        const response = await dispatch(fetchUser()).unwrap();
        if (!response) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error validating user:', error);
        navigate('/');
      }
    };

    if (!userData) {
      validateUser();
    }
  }, [dispatch, navigate, userData]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userData && userData.validUserOne) {
        try {
          const response = await axios.get(`${API_URL}/api/get-notification-of-user/${userData.validUserOne.userName}`);
          setNotifications(response.data.userNotifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };
    fetchNotifications();
  }, [userData]);

  const handleUserSelect = (userId) => {
    sessionStorage.setItem('selectedUserId', userId); // Save selected userId in sessionStorage
    dispatch(setSelectedUser(userId));  // Optionally, store in Redux as well
    setUserName(userId);  // Update state to reflect selected user name
  };

  const savedUserId = sessionStorage.getItem('selectedUserId');
  console.log(savedUserId);  // Outputs the stored userId

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown visibility
  };

  const filteredUsers = users.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ms-0">
      <div className="mt-4 col-lg-12 ">
        <Navbar expand="lg" className="mb-4 header-navbar ">
          <div className="w-100 px-2 d-flex align-items-center justify-content-between">
            <Navbar.Brand href="#home" className="brand-text">
              <span className="d-none d-lg-inline">User ID : </span>
              <span className='text-dark'><b>{userData?.validUserOne?.userName || 'Admin Developer'}</b></span>
              <button className='btn btn-success ms-2'>online</button>
            </Navbar.Brand>

            <div className='d-flex'>
              <div className="d-flex align-items-center icons">
                <Nav.Link className='me-3' href="#home" onClick={() => setIsDropdownOpenNotification(!isDropdownOpenNotification)}>
                  <i className="fa-regular fa-bell fa-1x"></i>
                  {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                </Nav.Link>
                {isDropdownOpenNotification && (
                  <div className="dropdown-container-notification">
                    {notifications.map((notification, index) => (
                      <div key={index} className="notification-item">
                        <div className="notification-message">
                          <h5>{notification.subject}</h5>
                          <p>{notification.message}</p>
                          <p>{notification.dateOfNotificationAdded}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Dropdown className="me-3 ">
                  <Dropdown.Toggle as={Nav.Link} bsPrefix="p-0" id="user-dropdown">
                    <i className="fa-solid fa-user"></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu align={dropdownAlignment}>
                    <Dropdown.Item><img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png" width={'100px'} alt="User Icon"></img></Dropdown.Item>
                    <Dropdown.Item>{userData?.validUserOne?.userName || 'Admin-Developer'}</Dropdown.Item>
                    <Dropdown.Item onClick={handleSignOut}>Sign Out</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleShow} />
            </div>
          </div>
        </Navbar>

        {userData?.validUserOne?.userType !== 'user' && (
          <div className="ms-0 mb-3">
            <div className=" col-lg-12 drop" style={{marginTop:'10%' , background:'none'}}>
              <Dropdown show={isDropdownOpen} onToggle={toggleDropdown}>
                <Dropdown.Toggle id="dropdown-basic" style={{backgroundColor:'#236a80' , outline:'none' , border:'none'}}>
                  {userName ? `Selected: ${userName}` : 'Select User'}
                </Dropdown.Toggle>

                <Dropdown.Menu style={{ maxHeight: '200px' }}>
                  <input
                    type="text"
                    placeholder="Search user..."
                    className="form-control"
                    style={{ margin: '10px', width: '90%' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                
                  {filteredUsers.length > 0 ? (
                    filteredUsers.slice(0, 4).map((user, index) => (
                      <Dropdown.Item
                        key={index}
                        onClick={() => handleUserSelect(user.userName)} 
                      >
                        {user.userName}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled>No users found</Dropdown.Item>
                  )}
                  {filteredUsers.length > 4 && (
                    <Dropdown.Item disabled>{`${filteredUsers.length - 4} more users available...`}</Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        )}

        <Outlet context={{ searchTerm: userName, isSearchTriggered: true }} />
        <Outlet />

        <Offcanvas show={show} onHide={handleClose} className="full-screen-offcanvas">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title></Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className='d-flex align-items-center justify-content-center'>
            <DashboardSam />
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </div>
  );
}

export default Hedaer;
