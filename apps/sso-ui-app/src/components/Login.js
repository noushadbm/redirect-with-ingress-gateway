import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // You can add any initialization logic here
        document.title = 'Login - OAuth Server';
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            debugger;
            // Get the redirect URL from query parameters
            const params = new URLSearchParams(window.location.search);
            const continueUrl = params.get('continue');
            console.log('Continue URL:', continueUrl);
            const response = await authService.login(username, password, continueUrl);
            

            if (response.success) {
                if (response.redirectUrl) {
                    // Redirect to the OAuth authorization URL
                    window.location.href = response.redirectUrl;
                } else if (continueUrl) {
                    // Redirect back to the OAuth authorization endpoint
                    window.location.href = continueUrl;
                } else {
                    // Default redirect
                    //window.location.href = 'http://localhost:9000';
                    window.location.href = 'http://192.168.0.170/gateway/auth';
                }
            }
        } catch (err) {
            setError(err || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Sign In</h2>
                <p className="subtitle">OAuth Authorization Server</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="footer">
                    <p>Forgot your password?</p>
                </div>
            </div>
        </div>
    );
}

export default Login;