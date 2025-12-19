import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

const authService = {
    login: async (username, password) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/auth/login`,
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