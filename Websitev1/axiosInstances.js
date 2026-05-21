import axios from 'axios';

const defaultAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3050",
});

defaultAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const userDetails = localStorage.getItem("userDetails");
      if (userDetails) {
        try {
          const user = JSON.parse(userDetails);
          if (user && user.token) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
          }
        } catch (e) {
          console.error("Error parsing userDetails from localStorage", e);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const kylasAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3050",
});

export { defaultAxios, kylasAxios };
