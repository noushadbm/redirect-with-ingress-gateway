import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import './MfaVerification.css';

function MfaVerification({ mfaData, onSuccess, onError }) {
    const [emailOtp, setEmailOtp] = useState('');
    const [authenticatorOtp, setAuthenticatorOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('email'); // 'email' or 'authenticator'
    const [emailVerified, setEmailVerified] = useState(false);

    useEffect(() => {
        // Determine which step to show first
        if (mfaData.mfaType === 'EMAIL_OTP') {
            setStep('email');
        } else if (mfaData.mfaType === 'AUTHENTICATOR_OTP') {
            setStep('authenticator');
        } else if (mfaData.mfaType === 'BOTH') {
            setStep('email'); // Start with email for BOTH
        }
    }, [mfaData]);

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.verifyMfa({
                sessionId: mfaData.sessionId,
                otpCode: emailOtp,
                verificationType: 'EMAIL'
            });

            if (response.success) {
                if (mfaData.mfaType === 'BOTH' && response.mfaRequired) {
                    // Move to authenticator step
                    setEmailVerified(true);
                    setStep('authenticator');
                    setEmailOtp('');
                } else {
                    // MFA complete
                    onSuccess(response);
                }
            } else {
                setError(response.message || 'Invalid OTP code');
            }
        } catch (err) {
            setError(err || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAuthenticator = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.verifyMfa({
                sessionId: mfaData.sessionId,
                otpCode: authenticatorOtp,
                verificationType: 'AUTHENTICATOR'
            });

            if (response.success && !response.mfaRequired) {
                // MFA complete
                onSuccess(response);
            } else if (!response.success) {
                setError(response.message || 'Invalid OTP code');
            }
        } catch (err) {
            setError(err || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await authService.resendOtp(mfaData.sessionId);
            if (response.success) {
                alert('OTP has been resent to your email');
            } else {
                setError('Failed to resend OTP');
            }
        } catch (err) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mfa-container">
            <div className="mfa-box">
                <h2>Two-Factor Authentication</h2>
                
                {step === 'email' && (mfaData.mfaType === 'EMAIL_OTP' || mfaData.mfaType === 'BOTH') && (
                    <>
                        <p className="subtitle">
                            We've sent a verification code to your email
                        </p>
                        
                        <form onSubmit={handleVerifyEmail}>
                            <div className="form-group">
                                <label htmlFor="emailOtp">Email Verification Code</label>
                                <input
                                    type="text"
                                    id="emailOtp"
                                    value={emailOtp}
                                    onChange={(e) => setEmailOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    maxLength="6"
                                    required
                                    autoFocus
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
                                {loading ? 'Verifying...' : 'Verify Email OTP'}
                            </button>
                        </form>

                        <div className="footer">
                            <button 
                                className="link-button" 
                                onClick={handleResendOtp}
                                disabled={loading}
                            >
                                Resend Code
                            </button>
                        </div>
                    </>
                )}

                {step === 'authenticator' && (mfaData.mfaType === 'AUTHENTICATOR_OTP' || 
                    (mfaData.mfaType === 'BOTH' && emailVerified)) && (
                    <>
                        <p className="subtitle">
                            Enter the code from your authenticator app
                        </p>
                        
                        <form onSubmit={handleVerifyAuthenticator}>
                            <div className="form-group">
                                <label htmlFor="authenticatorOtp">Authenticator Code</label>
                                <input
                                    type="text"
                                    id="authenticatorOtp"
                                    value={authenticatorOtp}
                                    onChange={(e) => setAuthenticatorOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    maxLength="6"
                                    required
                                    autoFocus
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
                                {loading ? 'Verifying...' : 'Verify Authenticator OTP'}
                            </button>
                        </form>

                        {emailVerified && (
                            <div className="success-indicator">
                                ✓ Email verified
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default MfaVerification;