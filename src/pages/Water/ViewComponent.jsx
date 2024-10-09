import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardSam from '../Dashboard/DashboardSam';
import Hedaer from '../Header/Hedaer';

const ViewComponent = () => {
  const location = useLocation();
  const { data, fromDate, toDate } = location.state || {};

  console.log('Data received:', data);
  console.log('From Date:', fromDate);
  console.log('To Date:', toDate);
  console.log('Type of data:', typeof data);  // Log the type of data

  // Fields to exclude
  const fieldsToExclude = [
    '_id', 
    'product_id', 
    'userName', 
    'companyName', 
    'email', 
    'mobileNumber', 
    'validationStatus', 
    'validationMessage', 
    'timestamp', // Ensure this is included
    '__v',
    'topic',
    'industryType'
  ];

  // Function to check if a key should be excluded
  const shouldExclude = (key) => fieldsToExclude.includes(key);

  // Function to get date fields and non-date fields
  const getOrderedFields = (item) => {
    const dateFields = Object.keys(item).filter(key => key.toLowerCase().includes('date') || key.toLowerCase().includes('time'));
    const nonDateFields = Object.keys(item).filter(key => !shouldExclude(key) && !dateFields.includes(key));
    return [...dateFields, ...nonDateFields];
  };

  // Render the component with the design from the Account component
  return (
    <div className="container-fluid">
      <div className="row" style={{ backgroundColor: 'white' }}>
        {/* Sidebar (hidden on mobile) */}
        <div className="col-lg-3 d-none d-lg-block">
          <DashboardSam />
        </div>
        {/* Main content */}
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-12">
              <Hedaer />
            </div>
          </div>
          <div>
            <div className="row" style={{ overflowX: 'hidden' }}>
              <div className="col-12 col-md-12 grid-margin">
                 <div className="col-12 d-flex justify-content-center align-items-center m-2 text-center">
                  <h1 className="text-center mt-3" style={{ justifyContent: 'center' }}></h1>
                </div> 
                <div className="card mt-2">
                  <div className="card-body">
                    <h4>From Date: {fromDate}</h4>
                    <h4>To Date: {toDate}</h4>
                    
                    {typeof data === 'object' && data !== null ? (
                      Array.isArray(data) ? (
                        <div style={{ overflowX: 'auto' }}>
                          <table className="table table-bordered " >
                            <thead>
                              <tr>
                                {getOrderedFields(data[0]).map((key) => (
                                  <th key={key}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {data.map((item, index) => (
                                <tr key={index}>
                                  {getOrderedFields(item).map((key, i) => (
                                    <td key={i}>{JSON.stringify(item[key], null, 2)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                {getOrderedFields(data).map((key) => (
                                  <th key={key}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                {getOrderedFields(data).map((key, index) => (
                                  <td key={index}>{JSON.stringify(data[key], null, 2)}</td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )
                    ) : (
                      <p>No data available or data is in an unexpected format.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewComponent;
