import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPaginate from 'react-paginate';

const ITEMS_PER_PAGE = 25; // Number of items per page

const ViewComponent = () => {
  const location = useLocation();
  const { data, fromDate, toDate } = location.state || {};

  const [currentPage, setCurrentPage] = useState(0);
  const [currentData, setCurrentData] = useState([]);

  // Update currentData whenever currentPage or data changes
  useEffect(() => {
    const offset = currentPage * ITEMS_PER_PAGE;
    const slicedData = data?.slice(offset, offset + ITEMS_PER_PAGE) || [];
    setCurrentData(slicedData);
  }, [currentPage, data]);

  // Handle pagination click
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected); // Update the current page based on user selection
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${String(date.getUTCDate()).padStart(2, '0')}/${String(
      date.getUTCMonth() + 1
    ).padStart(2, '0')}/${date.getUTCFullYear()}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${String(date.getUTCHours()).padStart(2, '0')}:${String(
      date.getUTCMinutes()
    ).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}`;
  };

  const filterStackData = (stack) => {
    const { _id, ...filteredData } = stack;
    return filteredData;
  };
  const handlePrint = () => {
    window.print();
  };
  return (
    <div className="container-fluid">
      <h4>From Date: {fromDate}</h4>
      <h4>To Date: {toDate}</h4>

      {currentData.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                {Object.keys(filterStackData(currentData[0]?.stackData[0] || {})).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) =>
                item.stackData.map((stack, stackIndex) => (
                  <tr key={`${index}-${stackIndex}`}>
                    <td>{formatDate(item.timestamp)}</td>
                    <td>{formatTime(item.timestamp)}</td>
                    {Object.values(filterStackData(stack)).map((value, i) => (
                      <td key={`${stackIndex}-${i}`}>{value}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available or data is in an unexpected format.</p>
      )}

      {data && data.length > ITEMS_PER_PAGE && (
        <ReactPaginate
          previousLabel={'Previous'}
          nextLabel={'Next'}
          breakLabel={'...'}
          pageCount={Math.ceil(data.length / ITEMS_PER_PAGE)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName={'pagination'}
          activeClassName={'active'}
          disabledClassName={'disabled'}
          breakClassName={'break-me'}
        />
      )}
      <button className="btn btn-primary" onClick={handlePrint} style={{ marginTop: '20px' }}>
        Print This Page
      </button>
    </div>
  );
};

export default ViewComponent;