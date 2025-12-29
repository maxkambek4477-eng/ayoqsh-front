import axios from "axios";
import { tokenStorage } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = tokenStorage.get();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            tokenStorage.remove();
            localStorage.removeItem("ayoqsh_user");
        }
        return Promise.reject(error);
    }
);

export default api;
