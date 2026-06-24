import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  // API_URL: "http://192.168.1.184:3000",
  timeout: 8000
});
