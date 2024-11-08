import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../../redux/features/user/userSlice';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';
import Energy from './Energy';
import TreatmentAnalysis from './TreatmentAnalysis';
import Maindashboard from '../Maindashboard/Maindashboard';
import { useOutletContext } from "react-router-dom";
import EnergyFlow from "./EneryFlow";
import EnergyOverview from './EnergyOverview';

const EnergyLayout = () => {
  


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
 <div className="row">
          <EnergyFlow />
        </div>

       <div className="row">
          <EnergyOverview />
        </div>
        <div className="row">
          <Energy  />
        </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyLayout;

