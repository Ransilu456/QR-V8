import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useState, useEffect } from 'react';

import authService  from '../services/authService';
import ToastHelper from '../components/ToastHelper';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('Checking for stored authentication...');
        
        // Clear redirect counters on auth check
        localStorage.removeItem('auth_redirect_count');
        localStorage.removeItem('auth_redirect_timestamp');
        
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        console.log('Auth check:', {
          tokenExists: !!token,
          userExists: !!storedUser,
          storage: localStorage.getItem('token') ? 'localStorage' : 'sessionStorage'
        });

        if (token && storedUser) {
          // Verify token expiration
          try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            // Also check if token format is valid (should have standard JWT fields)
            if (!decoded.exp || !decoded.iat) {
              console.error('Token missing required fields');
              logout();
              return;
            }
            
            // Check if token is expired or will expire in the next minute
            if (decoded.exp < currentTime + 60) {
              console.log('Token expired or about to expire, logging out');
              logout();
              return;
            }

            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('Valid token found, setting user:', parsedUser.email);
          } catch (tokenError) {
            console.error('Token validation error:', tokenError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setUser(null);
            return;
          }
        } else {
          console.log('No valid auth data found');
          setUser(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setLoading(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Attempting login for ${email} with "Remember Me": ${rememberMe}`);
      
      const response = await authService.login({ email, password });
      
      // Check if we have valid response data
      if (!response || !response.data) {
        throw new Error('Invalid server response. No data received.');
      }
      
      const { data } = response;
      
      // Check if token exists
      const token = data.token || data.accessToken;
      if (!token) {
        throw new Error('Invalid server response. No authentication token received.');
      }
      
      // Check if user data exists
      const userData = data.user || data.admin || data.userData;
      if (!userData) {
        throw new Error('Invalid server response. No user data received.');
      }
      
      // Clear any previous auth data from all storages
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('auth_redirect_count');
      localStorage.removeItem('auth_redirect_timestamp');
      
      // Store the new auth data in appropriate storage
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('rememberMe', 'true');
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('rememberMe', 'false');
      }
      
      // Validate the token was stored properly
      const storedToken = rememberMe ? localStorage.getItem('token') : sessionStorage.getItem('token');
      if (!storedToken) {
        throw new Error('Failed to store authentication data.');
      }
      
      setUser(userData);
      ToastHelper.success('Login successful!');
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage;
      
      if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
      ToastHelper.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.register(userData);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage;
      
      if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Please check your information and try again.';
      } else {
        errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (redirectToLogin = true) => {
    console.log('Logging out, clearing all auth storage');
    
    // Clear auth redirection counts and timestamps
    localStorage.removeItem('auth_redirect_count');
    localStorage.removeItem('auth_redirect_timestamp');
    
    // Try to call logout API in the background
    try {
      // Don't await this call to ensure UI remains responsive
      authService.logout().catch(err => {
        console.error('Logout API call failed:', err);
      });
    } catch (error) {
      console.error('Error during logout API call:', error);
    }
    
    // Clear tokens and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    
    // Update application state
    setUser(null);
    
    // Show success message
    ToastHelper.info('You have been logged out');
    
    // Redirect to login page if needed
    if (redirectToLogin) {
      const currentPath = window.location.pathname;
      
      // Only redirect if we're not already on the login page
      if (!currentPath.includes('/login')) {
        setTimeout(() => {
          window.location.href = `/login${currentPath && currentPath !== '/' ? `?from=${encodeURIComponent(currentPath)}` : ''}`;
        }, 500);
      }
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      ToastHelper.success('Password reset instructions sent to your email');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      setError(message);
      ToastHelper.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      await authService.resetPassword(token, password);
      ToastHelper.success('Password reset successful! You can now log in with your new password.');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      setError(message);
      ToastHelper.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(data);
      
      if (response.data) {
        const updatedUser = response.data.admin || response.data.user || response.data;
        setUser(updatedUser);
      }
      
      ToastHelper.success('Profile updated successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      setError(message);
      ToastHelper.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      await authService.updatePassword({ currentPassword, newPassword });
      ToastHelper.success('Password updated successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update password';
      setError(message);
      ToastHelper.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;