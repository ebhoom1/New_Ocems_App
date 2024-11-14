// Change this to false if you want to use the non-secure URL

// apiConfig.js

export const API_URL = process.env.REACT_APP_API_URL;
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;


//http://ocems.ebhoom.com:5555
//https://api.ocems.ebhoom.com
//http://localhost:5555


console.log('API URL:', API_URL);
console.log('Socket URL:', SOCKET_URL);