import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDifferenceDataByUserName } from "../../redux/features/iotData/iotDataSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Function to extract unique dates from the difference data
const extractUniqueDates = (data) => {
  const uniqueDates = new Set();
  data.forEach((item) => {
    const formattedDate = item.date.split('/').reverse().join('-'); // Assuming 'DD/MM/YYYY'
    uniqueDates.add(formattedDate);
  });
  return Array.from(uniqueDates).map((date) => ({
    original: date,
    formatted: new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  }));
};

const WaterFlow = ({ searchTerm, userData, userType }) => {
  const dispatch = useDispatch();
  const selectedUserIdFromRedux = useSelector((state) => state.selectedUser.userId);
  const { differenceData, error } = useSelector((state) => state.iotData);

  const [datesHeaders, setDatesHeaders] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(
    userType === "admin" ? "KSPCB001" : userData?.validUserOne?.userName
  );

  // Fetch data function
  const fetchData = async (userName) => {
    try {
      const result = await dispatch(fetchDifferenceDataByUserName(userName)).unwrap();
      console.log("Fetched Data:", result); // Debugging
      setSearchResult(userName); // Set the searched user ID
    } catch {
      toast.error("Difference data is not found");
      setSearchResult(null);
    }
  };

  // Extract unique dates when differenceData changes
  useEffect(() => {
    if (differenceData && Array.isArray(differenceData)) {
      const uniqueDates = extractUniqueDates(differenceData);
      setDatesHeaders(uniqueDates);
    }
  }, [differenceData]);

  // Fetch data based on search term or user data
  useEffect(() => {
    if (searchTerm) fetchData(searchTerm);
    else if (userData && userType === "user") fetchData(userData.validUserOne.userName);
  }, [searchTerm, userData, userType, dispatch]);

  // Fetch data on mount or when currentUserName changes
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("selectedUserId");
    const userName = selectedUserIdFromRedux || storedUserId || currentUserName;
    fetchData(userName);
    if (storedUserId) {
      setCurrentUserName(storedUserId);
    }
  }, [selectedUserIdFromRedux, currentUserName, dispatch]);

  // Function to get data for a specific date
  const getDataForDate = (date) => {
    if (!differenceData || !Array.isArray(differenceData)) {
      return {}; // Return an empty object if data is not available
    }

    const formatDifferenceDataDate = (dateString) => {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    const data = differenceData.find(
      (item) => formatDifferenceDataDate(item.date) === date.original
    );

    console.log(`Data for ${date.original}:`, data); // Debugging
    return data || {};
  };

  // Filter datesHeaders to show only those with corresponding data
  const filteredDates = datesHeaders.filter((date) => {
    const dataForDate = getDataForDate(date);
    return (
      dataForDate.initialEnergy ||
      dataForDate.finalEnergy ||
      dataForDate.energyDifference
    );
  });

  // Safely render data or show "N/A"
  const safeRender = (value) =>
    typeof value === "number" || typeof value === "string" ? value : "N/A";

  return (
    <div>
          <h4 className="text-center mt-5">User ID: <span style={{color:'#236a80'}}>{searchResult || currentUserName}</span></h4>
    <div className="card mt-3">
      <div className="card-body">
        {/* Displaying the selected user ID dynamically */}
        <h2 className="">Water Flow</h2>
        {error && <p className="text-danger">{error}</p>}
        <div className="table-responsive mt-3">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>SI.No</th>
                <th>Parameter</th>
                <th>Acceptable <br /> Limits</th>
                {filteredDates.map((date, index) => (
                  <th key={index}>{date.formatted}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={3}>1</td>
                <td rowSpan={3}>FL-Inlet raw sewage, KLD</td>
                <td>Initial Flow</td>
                {filteredDates.map((date, index) => (
                  <td key={index}>
                    {safeRender(getDataForDate(date).initialEnergy)}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Final Flow</td>
                {filteredDates.map((date, index) => (
                  <td key={index}>
                    {safeRender(getDataForDate(date).finalEnergy)}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Flow Difference</td>
                {filteredDates.map((date, index) => (
                  <td key={index}>
                    {safeRender(getDataForDate(date).energyDifference)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <ToastContainer />
      </div>
    </div>
    </div>
  );
};

export default WaterFlow;
