import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Oval } from 'react-loader-spinner';
import Select from 'react-select';
import moment from 'moment';
import './index.css';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';
import { useSelector } from 'react-redux';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ConsumptionPredictionGraphEnergy = () => {
    const { userType, userData } = useSelector((state) => state.user);
    const [userName, setUserName] = useState('');
    const [stackName, setStackName] = useState('');
    const [dataType, setDataType] = useState('consumption');
    const [graphData, setGraphData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timeInterval, setTimeInterval] = useState('hourly');
    const [users, setUsers] = useState([]);
    const [stackOptions, setStackOptions] = useState([]);

    // Fetch users if the user is an admin
    useEffect(() => {
        if (userType === 'admin') {
            fetchUsers();
        } else if (userType === 'user' && userData?.validUserOne?.userName) {
            setUserName(userData.validUserOne.userName);
            fetchStackOptions(userData.validUserOne.userName);
        }
    }, [userType, userData]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/getallusers`);
            const usersData = response.data.users.map((user) => ({
                value: user.userName,
                label: user.userName,
            }));
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleUserChange = async (selectedUser) => {
        setUserName(selectedUser.value);
        fetchStackOptions(selectedUser.value);
    };

    const fetchStackOptions = async (userName) => {
        try {
            const response = await axios.get(`${API_URL}/api/get-stacknames-by-userName/${userName}`);
            const filteredStacks = response.data.stackNames.filter(
                (stack) => stack.stationType === 'energy'
            );
            const stacks = filteredStacks.map((stack) => ({
                value: stack.name,
                label: stack.name,
            }));
            setStackOptions(stacks);
        } catch (error) {
            console.error('Error fetching stack names:', error);
        }
    };

    useEffect(() => {
        if (userName && stackName) {
            fetchGraphData();
        }
    }, [userName, stackName, timeInterval, dataType]);

    const fetchGraphData = async () => {
        setLoading(true);
        try {
            const endpoint =
                dataType === 'consumption'
                    ? `${API_URL}/api/consumptionData/${userName}/${stackName}/${timeInterval}`
                    : `${API_URL}/api/predictionData/${userName}/${stackName}/${timeInterval}`;
            const response = await axios.get(endpoint);
            setGraphData(response.data);
        } catch (error) {
            console.error('Error fetching graph data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processData = () => {
        if (!Array.isArray(graphData) || graphData.length === 0) {
            return { labels: [], energy:[], };
        }

        const labels = graphData.map((entry) =>
            moment(entry.timestamp).format('DD/MM/YYYY HH:mm')
        );

       

        const energy = graphData.map((entry) => {
            const data = dataType === 'consumption'
                ? entry.totalConsumptionData?.[0]
                : entry.predictionData?.[0];
            return data ? data.energy || data.predictedEnergy   || 0 : 0;
        });

        return { labels, energy };
    };

    const { labels, energy } = processData();

    const chartData = {
        labels,
        datasets: [
            {
                label: dataType === 'consumption' ? 'energy' : 'Predicted energy',
                data: energy,
                borderColor: '#3498db',
                backgroundColor: '#3498db',
                tension: 0.3,
                fill: false,
                pointRadius: 5, // Default size of the dots
                pointHoverRadius: 10, // Size of the dots on hover
                pointHoverBorderWidth: 3, // Border width on hover
            },
            // {
            //     label: dataType === 'consumption' ? 'Final Flow' : 'Predicted Final Flow',
            //     data: finalFlowValues,
            //     borderColor: '#2ecc71',
            //     backgroundColor: '#2ecc71',
            //     tension: 0.3,
            //     fill: false,
            //     pointRadius: 5, // Default size of the dots
            //     pointHoverRadius: 10, // Size of the dots on hover
            //     pointHoverBorderWidth: 3, // Border width on hover
            // },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: true, position: 'top' },
            title: {
                display: true,
                text: `${dataType === 'consumption' ? 'Consumption' : 'Prediction'} Over Time`,
            },
        },
        scales: {
            x: { title: { display: true, text: 'Time Interval' } },
            y: { title: { display: true, text: 'Values' }, beginAtZero: true },
        },
    };

    return (
        <div className="container">
            <h3 className="text-center mb-4">Garph of Consumption & Prediction</h3>

            <div className="row mb-4">
                {userType === 'admin' && (
                    <div className="col-md-4">
                        <Select
                            options={users}
                            onChange={handleUserChange}
                            placeholder="Select User Name"
                        />
                    </div>
                )}
                <div className="col-md-4">
                    <Select
                        options={stackOptions}
                        onChange={(option) => setStackName(option.value)}
                        placeholder="Select Stack Name"
                        isDisabled={!stackOptions.length}
                    />
                </div>
                <div className="col-md-4">
                    <Select
                        options={[
                            { value: 'consumption', label: 'Consumption' },
                            { value: 'prediction', label: 'Prediction' },
                        ]}
                        onChange={(option) => setDataType(option.value)}
                        placeholder="Consumption"
                    />
                </div>
            </div>

            <div className="interval-buttons mb-4">
                {['hourly', 'daily', 'weekly', 'monthly'].map((interval) => (
                    <button
                        key={interval}
                        className={`interval-btn ${timeInterval === interval ? 'active' : ''}`}
                        onClick={() => setTimeInterval(interval)}
                    >
                        {interval.charAt(0).toUpperCase() + interval.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                    <Oval height={60} width={60} color="#3498db" />
                    <p className="ml-3">Loading data, please wait...</p>
                </div>
            ) : graphData.length === 0 ? (
                <div className="chart-container">
                    <p className="text-center">No data available</p>
                </div>
            ) : (
                <div className="chart-container">
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}
        </div>
    );
};

export default ConsumptionPredictionGraphEnergy;
