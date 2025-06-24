import useAuthStore from '@/state/authstore';
import axios from 'axios';

const axiosInstance = axios.create({ baseURL: 'http://localhost:2469/api' });
// const axiosInstance = axios.create({ baseURL: 'http://134.199.210.228:2469/api' });
// const axiosInstance = axios.create({ baseURL: 'https://www.pathofcommunity.com/api' });

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) config.headers['Authorization'] = `Bearer ${token}`;

  return config;
},)

export default axiosInstance;
