import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../../redux/features/user/userSlice';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import WaterFlow from './WaterFlow';
import TotalSewageGraph from './TotalSewageGraph';
import Maindashboard from '../Maindashboard/Maindashboard';
import QuantityFlow from './QuantityFlow';
import EffluentFlowOverview from './EffluentFlowOverview';

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
            <div className="col-12">
            <h3 className="page-title text-center">EFFLUENT FLOW DASHBOARD</h3>
          </div>
          </div>
          <div className="row">
          <QuantityFlow />
        </div>
        <div className="row">
          <EffluentFlowOverview />
        </div>

         <WaterFlow/>
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
  );
};

export default Quantity;
