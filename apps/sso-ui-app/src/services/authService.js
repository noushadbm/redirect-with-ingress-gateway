import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000';
const API_BASE_URL = 'http://192.168.0.170/gateway/auth';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

const authService = {
    login: async (username, password, continueUrl) => {
        debugger;
        try {
            const url = continueUrl 
                ? `${API_BASE_URL}/api/auth/login?continueUrl=${encodeURIComponent(continueUrl)}`
                : `${API_BASE_URL}/api/auth/login`;

            const response = await axios.post(
                url,
                {
                    username,
                    password
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    },

    logout: async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/auth/logout`);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
};

export default authService;