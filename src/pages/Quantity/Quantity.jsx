import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../../redux/features/user/userSlice';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import WaterFlow from './WaterFlow';
import TotalSewageGraph from './TotalSewageGraph';
import Maindashboard from '../Maindashboard/Maindashboard';

const Quantity = () => {
  
  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: 'white' }}>
        {/* Sidebar (hidden on mobile) */}
        <div className="col-lg-3 d-none d-lg-block ">
          <DashboardSam />
        </div>
        {/* Main content */}
        <div className="col-lg-9 col-12 ">
          <div className="row">
            <div className="col-12">
              <Hedaer />
            </div>
            <div className="col-12">
              <Maindashboard />
            </div>
          </div>
         <WaterFlow/>
         <TotalSewageGraph/>
        </div>
      </div>
    </div>
  );
};

export default Quantity;
