import React, { useState, useEffect } from 'react';
import { Shield, LogOut, User, CheckCircle } from 'lucide-react';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // OIDC Configuration
  const OIDC_CONFIG = {
    authServer: 'http://192.168.0.170/gateway/auth/',
    backend: 'http://localhost:8081',
    clientId: 'oidc-client',
    clientSecret: 'secret',
    redirectUri: window.location.origin + '/callback',
    scope: 'openid profile email'
  };

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('user_info');
    
    if (token && userInfo) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userInfo));
      setLoading(false);
    } else {
      // Check if redirected back from auth server
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        handleCallback(code);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const handleLogin = () => {
    const state = generateRandomString(32);
    const nonce = generateRandomString(32);
    
    // Store state for validation
    sessionStorage.setItem('oauth_state', state);
    console.log('Stored State:', state);
    sessionStorage.setItem('oauth_nonce', nonce);
    
    // Build authorization URL
    const authUrl = `${OIDC_CONFIG.authServer}/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${encodeURIComponent(OIDC_CONFIG.clientId)}&` +
      `redirect_uri=${encodeURIComponent(OIDC_CONFIG.redirectUri)}&` +
      `scope=${encodeURIComponent(OIDC_CONFIG.scope)}&` +
      `state=${state}&` +
      `nonce=${nonce}`;
    
    // Redirect to authorization server
    window.location.href = authUrl;
  };

  const handleCallback = async (code) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate state
      const urlParams = new URLSearchParams(window.location.search);
      const returnedState = urlParams.get('state');
      const storedState = sessionStorage.getItem('oauth_state');
      
      console.log('Returned State:', returnedState);
      console.log('Stored State:', storedState);
      if (returnedState !== storedState) {
        throw new Error('Invalid state parameter');
      }
      
      // Exchange code for tokens
      // const tokenResponse = await fetch(`${OIDC_CONFIG.authServer}/oauth2/token`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //     'Authorization': 'Basic ' + btoa(`${OIDC_CONFIG.clientId}:${OIDC_CONFIG.clientSecret}`)
      //   },
      //   body: new URLSearchParams({
      //     grant_type: 'authorization_code',
      //     code: code,
      //     redirect_uri: OIDC_CONFIG.redirectUri
      //   })
      // });
      const tokenResponse = await fetch(`${OIDC_CONFIG.backend}/token/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${OIDC_CONFIG.clientId}:${OIDC_CONFIG.clientSecret}`)
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: OIDC_CONFIG.redirectUri
        })
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange authorization code');
      }
      
      const tokens = await tokenResponse.json();
      
      // Store tokens
      localStorage.setItem('access_token', tokens.data.access_token);
      localStorage.setItem('refresh_token', tokens.data.refresh_token);
      localStorage.setItem('id_token', tokens.data.id_token);

      console.log('Access Token:', tokens.data.access_token);
      
      // Get user info
      // const userInfoResponse = await fetch(`${OIDC_CONFIG.authServer}/userinfo`, {
      //   headers: {
      //     'Authorization': `Bearer ${tokens.access_token}`
      //   }
      // });
      const userInfoResponse = await fetch(`${OIDC_CONFIG.backend}/user/userinfo`, {
        headers: {
          'Authorization': `Bearer ${tokens.data.access_token}`
        }
      });
      
      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info');
      }
      
      const userInfo = await userInfoResponse.json();
      
      // Store user info
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      
      // Update state
      setUser(userInfo);
      setIsAuthenticated(true);
      
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
      
      // Clean up session storage
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_nonce');
      
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message);
      // Clean up on error
      localStorage.clear();
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset state
    setIsAuthenticated(false);
    setUser(null);
    
    // Optional: Redirect to auth server logout
    window.location.href = `${OIDC_CONFIG.authServer}/logout`;
  };

  const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                window.location.href = '/';
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
            <p className="text-gray-600">Sign in to access your account</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              <Shield className="w-6 h-6" />
              Login with SSO
            </button>

            <div className="text-center text-sm text-gray-500 mt-6">
              <p>Secure authentication powered by OpenID Connect</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-semibold mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-700">Username: <code className="bg-blue-100 px-2 py-1 rounded">user</code></p>
            <p className="text-xs text-blue-700">Password: <code className="bg-blue-100 px-2 py-1 rounded">password</code></p>
          </div>
        </div>
      </div>
    );
  }

  // Home Page (Authenticated)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-800">My Application</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || user?.preferred_username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                Welcome back, {user?.name || user?.preferred_username || 'User'}! 
                <CheckCircle className="w-6 h-6 text-green-500" />
              </h2>
              <p className="text-gray-600">You are successfully authenticated</p>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              User Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Username</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user?.preferred_username || user?.sub}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user?.email || 'Not provided'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Email Verified</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user?.email_verified ? '✓ Yes' : '✗ No'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Subject ID</p>
                <p className="text-sm font-mono text-gray-800 break-all">
                  {user?.sub}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Access</h3>
            <p className="text-gray-600 text-sm">Your session is protected with OpenID Connect authentication</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Verified Identity</h3>
            <p className="text-gray-600 text-sm">Your identity has been verified by the authorization server</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile Access</h3>
            <p className="text-gray-600 text-sm">Access to your profile information and preferences</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Details</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-xs text-gray-700 overflow-x-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;