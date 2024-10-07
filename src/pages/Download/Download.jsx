import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { API_URL } from '../../utils/apiConfig';
import moment from 'moment';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Toastify styles
import logo from '../../assests/images/ebhoom.png';  // Import logo
import { useNavigate } from 'react-router-dom';
import FooterM from '../FooterMain/FooterM';

const Download = () => {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [industry, setIndustry] = useState("");
    const [company, setCompany] = useState("");
    const [format, setFormat] = useState("");
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

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

    const handleDownload = async (e) => {
        e.preventDefault();
        const formattedDateFrom = moment(dateFrom).format('DD-MM-YYYY');
        const formattedDateTo = moment(dateTo).format('DD-MM-YYYY');

        // Trim leading and trailing spaces from parameters
        const trimmedIndustry = industry.trim();
        const trimmedCompany = company.trim();

        // Construct the query string
        const queryParams = {
            fromDate: formattedDateFrom,
            toDate: formattedDateTo,
            industryName: trimmedIndustry,
            companyName: trimmedCompany,
            format
        };

        const queryString = Object.entries(queryParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        const requestUrl = `${API_URL}/api/downloadIotData?${queryString}`;

        try {
            const response = await axios.get(requestUrl, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `iot_data.${format}`);
            document.body.appendChild(link);
            link.click();
            toast.success(`IoT Data downloaded successfully in ${format} format`);
        } catch (error) {
            console.error("Error downloading data:", error);
            toast.error(`Error in downloading IoT data`);
        }
    };

    const industryType = [
        { category: "Sugar" },
        { category: "Cement" },
        { category: "Distillery" },
        { category: "Petrochemical" },
        { category: "Pulp & Paper" },
        { category: "Fertilizer" },
        { category: "Tannery" },
        { category: "Pesticides" },
        { category: "Thermal Power Station" },
        { category: "Caustic Soda" },
        { category: "Pharmaceuticals" },
        { category: "Chemical" },
        { category: "Dye and Dye Stuff" },
        { category: "Refinery" },
        { category: "Copper Smelter" },
        { category: "Iron and Steel" },
        { category: "Zinc Smelter" },
        { category: "Aluminium" },
        { category: "STP/ETP" },
        { category: "NWMS/SWMS" },
        { category: "Noise" },
        { category: "Chemical" },
        { category: "Other" },
    ];

    const handleHome = () => {
        navigate('/');
    };

    return (
        <div>
            <div className="row" style={{ overflowX: 'hidden' }}>
                <div className="col-12 col-md-12 grid-margin">
                    <div className="col-12 d-flex justify-content-between align-items-center m-3 p-5">
                        <img src={logo} alt="" />
                        <button className='btn' onClick={handleHome} style={{ backgroundColor: 'white' }}>Home</button>
                    </div>
                    <h1 className='text-center mt-5'>Download IoT Data</h1>
                    <div className="card ms-2 me-2">
                        <div className="card-body">
                            <form className='p-5' onSubmit={handleDownload}>
                                <div className="row">
                                    {/* Select Industry */}
                                    <div className="col-lg-6 col-md-6 mb-4">
                                        <div className="form-group">
                                            <label htmlFor="industry" className="form-label">Select Industry</label>
                                            <select id="industry" className="form-control text-start" value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                                <option>select</option>
                                                {industryType.map((item, index) => (
                                                    <option key={index} value={item.category}>{item.category}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Select Company */}
                                    <div className="col-lg-6 col-md-6 mb-4">
                                        <div className="form-group">
                                            <label htmlFor="company" className="form-label">Select Company</label>
                                            <select id="company" className="form-control" value={company} onChange={(e) => setCompany(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                                <option>select</option>
                                                {users.map((item) => (
                                                    <option key={item.companyName} value={item.companyName}>{item.companyName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* From Date */}
                                    <div className="col-lg-6 col-md-6 mb-4">
                                        <div className="form-group">
                                            <label htmlFor="from-date" className="form-label">From Date</label>
                                            <input id="from-date" className="form-control" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />
                                        </div>
                                    </div>

                                    {/* To Date */}
                                    <div className="col-lg-6 col-md-6 mb-4">
                                        <div className="form-group">
                                            <label htmlFor="to-date" className="form-label">To Date</label>
                                            <input id="to-date" className="form-control" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '10px' }} />
                                        </div>
                                    </div>

                                    {/* Download Format */}
                                    <div className="col-lg-6 col-md-6 mb-4">
                                        <div className="form-group">
                                            <label htmlFor="format" className="form-label">Download Format</label>
                                            <select id="format" className="form-control" value={format} onChange={(e) => setFormat(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '10px' }}>
                                                <option>select</option>
                                                <option value="pdf">PDF</option>
                                                <option value="csv">CSV</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn" style={{ backgroundColor: '#236a80', color: 'white' }}>Download</button>
                            </form>
                            <ToastContainer />
                        </div>
                    </div>
                </div>
            </div>
            <FooterM />
        </div>
    );
}

export default Download;
