import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import MfaVerification from './MfaVerification'; // Add this import
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaData, setMfaData] = useState(null);

    useEffect(() => {
        document.title = 'Login - OAuth Server';
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Get the redirect URL from query parameters
            const params = new URLSearchParams(window.location.search);
            const continueUrl = params.get('continue');
            console.log('Continue URL:', continueUrl);
            
            const response = await authService.login(username, password, continueUrl);
            
            if (response.mfaRequired) {
                // Show MFA verification screen
                setMfaRequired(true);
                setMfaData(response);
            } else if (response.success) {
                // Direct login success (no MFA)
                handleLoginSuccess(response);
            }
        } catch (err) {
            setError(err || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = (response) => {
        if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
        } else {
            const params = new URLSearchParams(window.location.search);
            const continueUrl = params.get('continue');

            if (continueUrl) {
                window.location.href = decodeURIComponent(continueUrl);
            } else {
                window.location.href = 'http://192.168.0.170/gateway/auth';
            }
        }
    };

    const handleMfaSuccess = (response) => {
        handleLoginSuccess(response);
    };

    const handleMfaError = (error) => {
        setError(error);
        setMfaRequired(false);
        setMfaData(null);
    };

    if (mfaRequired && mfaData) {
        return (
            <MfaVerification
                mfaData={mfaData}
                onSuccess={handleMfaSuccess}
                onError={handleMfaError}
            />
        );
    }

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