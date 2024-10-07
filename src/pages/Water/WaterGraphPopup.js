import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAverageDataByUserName } from '../../redux/features/iotData/iotDataSlice';
import { toast } from 'react-toastify';
import { Modal, Button, Nav } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import './watergraph.css'; // Make sure the CSS is appropriately adjusted for your needs
import moment from 'moment';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const WaterGraphPopup = ({ show, handleClose, parameter, userName }) => {
    const dispatch = useDispatch();
    const [timeInterval, setTimeInterval] = useState('hour');

    const [selectedTab, setSelectedTab] = useState('daily');
    const [dataByInterval, setDataByInterval] = useState({});
    const [loadingByInterval, setLoadingByInterval] = useState({});
    const [errorByInterval, setErrorByInterval] = useState({});

    useEffect(() => {
        if (userName && parameter) {
            setLoadingByInterval(prevState => ({
                ...prevState,
                [timeInterval]: true
            }));
            setErrorByInterval(prevState => ({
                ...prevState,
                [timeInterval]: null
            }));

            dispatch(fetchAverageDataByUserName({ userName, interval: timeInterval }))
                .unwrap()
                .then((data) => {
                    setDataByInterval(prevState => ({
                        ...prevState,
                        [timeInterval]: data
                    }));
                })
                .catch(() => {
                    toast.error(`${timeInterval} graph not found`);
                    setDataByInterval(prevState => ({
                        ...prevState,
                        [timeInterval]: []
                    }));
                    setErrorByInterval(prevState => ({
                        ...prevState,
                        [timeInterval]: `${timeInterval} graph not found`
                    }));
                })
                .finally(() => {
                    setLoadingByInterval(prevState => ({
                        ...prevState,
                        [timeInterval]: false
                    }));
                });
        }
    }, [timeInterval, userName, parameter, dispatch]);

    const getData = () => {
        const data = dataByInterval[selectedTab] || [];
        return {
            labels: data.map(item => item.timestamp),
            datasets: [{
                label: parameter,
                data: data.map(item => item.value),
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.4)',
                borderColor: '#36A2EB',
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#236a80',
                pointHoverRadius: 7,
            }],
        };
    };
    const processData = (data, interval) => {
        if (!Array.isArray(data) || data.length === 0) {
            return { labels: [], values: [] };
        }

        let labels;
        switch (interval) {
            case 'hour':
                labels = data.map(entry => moment(entry.timestamp).format('HH:mm'));
                break;
            case 'day':
                labels = data.map(entry => moment(entry.timestamp).format('HH:mm'));
                break;
            case 'week':
                labels = data.map(entry => moment(entry.timestamp).format('ddd'));
                break;
            case 'month':
                labels = data.map(entry => moment(entry.timestamp).format('MMM'));
                break;
            case 'sixmonths':
                labels = data.map(entry => moment(entry.timestamp).format('MMM YYYY'));
                break;
            case 'year':
                labels = data.map(entry => moment(entry.timestamp).format('MMM YYYY'));
                break;
            default:
                labels = data.map(entry => entry.interval);
        }
        const values = data.map(entry => entry[parameter]);

        return { labels, values };
    };
    const { labels, values } = processData(dataByInterval[timeInterval], timeInterval);
    const options = {
        scales: {
            x: { grid: { display: false } },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.raw;
                    }
                }
            }
        }
    };
    const chartData = {
        labels,
        datasets: [
            {
                label: parameter,
                data: values,
                fill: false,
                backgroundColor: '#82ca9d',
                borderColor: '#82ca9d',
            },
        ],
    };
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
            height: '50%',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }
    };


    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{parameter} Graph</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <div className="btn-group" role="group" aria-label="Date Range">
                <button className="btn btn-primary" onClick={() => setTimeInterval('hour')}>Hour</button>
                <button className="btn btn-primary" onClick={() => setTimeInterval('day')}>Day</button>
                <button className="btn btn-primary" onClick={() => setTimeInterval('week')}>Week</button>
                <button className="btn btn-primary" onClick={() => setTimeInterval('month')}>Month</button>
                <button className="btn btn-primary" onClick={() => setTimeInterval('sixmonths')}>6 Months</button>
                <button className="btn btn-primary" onClick={() => setTimeInterval('year')}>Year</button>
            </div>
                <div className="chart-container">
                    {loadingByInterval[selectedTab] ? (
                        <p>Loading...</p>
                    ) : errorByInterval[selectedTab] ? (
                        <p>{errorByInterval[selectedTab]}</p>
                    ) : (
                        <Line data={chartData} />
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default WaterGraphPopup;
