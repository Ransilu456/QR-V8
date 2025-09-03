import api from './api';
import ToastHelper from '../components/ToastHelper';

const authService = {
  
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', { email: credentials.email, passwordProvided: !!credentials.password });
      const response = await api.post('/admin/login', credentials);

      console.log('Login response received:', {
        status: response.status,
        hasToken: !!response.data?.token || !!response.data?.accessToken,
        hasUser: !!response.data?.user || !!response.data?.admin,
        dataKeys: Object.keys(response.data || {})
      });

      if (response.data) {
        const token = response.data.token || response.data.accessToken;
        const userData = response.data.user || response.data.admin || response.data.userData;
        
        if (token) {
          localStorage.setItem('token', token);
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
           /* if (userData.role) {
              localStorage.setItem('userRole', userData.role);
            }*/
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (!error.response) {
        ToastHelper.error('Cannot connect to server. Please check if the server is running.');
      } else if (error.response?.status === 429) {
        ToastHelper.error('Too many login attempts. Please try again later.');
      } else if (error.response?.status === 401) {
        ToastHelper.error('Invalid credentials. Please try again.');
      }
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/admin/logout');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userRole');
      
      console.log('User logged out successfully');
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userRole');
      
      if (!error.response) {
        ToastHelper.error('Cannot connect to server. Your session has been cleared locally.');
      }
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('Name, email and password are required');
      }
      
      const response = await api.post('/admin/register', userData);
      ToastHelper.success('Registration successful. You can now log in.');
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('exists')) {
        ToastHelper.error('This email is already registered.');
      } else {
        ToastHelper.error(error.response?.data?.message || 'Registration failed');
      }
      throw error;
    }
  },
  
  forgotPassword: async (email) => {
    try {
      console.log('Sending password reset request for email:', email);
      
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }
      
      const response = await api.post('/admin/forgot-password', { email });
      
      console.log('Password reset request response:', {
        status: response.status,
        success: response.status === 200
      });
      
      ToastHelper.success('If a user with that email exists, a password reset link has been sent.');
      return response;
    } catch (error) {
      console.error('Password reset request error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      ToastHelper.success('If a user with that email exists, a password reset link has been sent.');
      throw error;
    }
  },
  
  resetPassword: async (token, password) => {
    try {
      console.log('Resetting password with token');
      
      if (!token) {
        throw new Error('Reset token is required');
      }
      
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      const response = await api.post(`/admin/reset-password/${token}`, { password });
      
      console.log('Password reset response:', {
        status: response.status,
        success: response.status === 200
      });
      
      ToastHelper.success('Password reset successful. You can now log in with your new password.');
      return response;
    } catch (error) {
      console.error('Password reset error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (!error.response) {
        ToastHelper.error('Cannot connect to server. Please check your internet connection.');
      } else if (error.response?.status === 400) {
        ToastHelper.error('Invalid or expired reset token');
      }
      throw error;
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/admin/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  updateProfile: async (data) => {
    try {
      if (!data || (!data.name && !data.email)) {
        throw new Error('Profile data is required');
      }
      
      console.log('Updating profile with data:', { ...data, passwordProvided: false });
      
      console.log('Auth tokens status:', {
        hasLocalToken: !!localStorage.getItem('token'),
        hasSessionToken: !!sessionStorage.getItem('token'),
        tokenUsed: localStorage.getItem('token') || sessionStorage.getItem('token')
      });
      
      const response = await api.patch('/admin/profile', data);
      
      console.log('Profile update response:', {
        status: response.status,
        success: response.data?.success,
        hasAdmin: !!response.data?.admin,
        hasUser: !!response.data?.user,
        dataFields: Object.keys(response.data || {})
      });
      
      if (response.data && (response.data.admin || response.data.user)) {
        const updatedUser = response.data.admin || response.data.user;
        
        if (localStorage.getItem('token')) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          if (updatedUser.role) {
            localStorage.setItem('userRole', updatedUser.role);
          }
        } else if (sessionStorage.getItem('token')) {
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
          if (updatedUser.role) {
            sessionStorage.setItem('userRole', updatedUser.role);
          }
        }
        
        console.log('User data stored successfully');
      }
      
      ToastHelper.success('Profile updated successfully');
      return response;
    } catch (error) {
      console.error('Profile update error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (!error.response) {
        ToastHelper.error('Cannot connect to server. Please check your internet connection.');
      } else if (error.response.status === 403) {
        ToastHelper.error('You do not have permission to update this profile.');
      } else if (error.response.status === 401) {
        ToastHelper.error('Your session has expired. Please log in again.');
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } else {
        ToastHelper.error(error.response?.data?.message || 'Failed to update profile');
      }
      throw error;
    }
  },
  
  updatePassword: async (data) => {
    try {
      console.log('Updating password');
      
      if (!data.currentPassword || !data.newPassword) {
        throw new Error('Current password and new password are required');
      }
      
      if (data.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }
      
      const response = await api.post('/admin/update-password', data);
      
      console.log('Password update response:', {
        status: response.status,
        success: response.status === 200
      });
      
      ToastHelper.success('Password updated successfully');
      return response;
    } catch (error) {
      console.error('Password update error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (!error.response) {
        ToastHelper.error('Cannot connect to server. Please check if the server is running.');
      } else if (error.response?.status === 401) {
        ToastHelper.error('Current password is incorrect');
      } else {
        ToastHelper.error(error.response?.data?.message || 'Failed to update password');
      }
      throw error;
    }
  },
  
  getUserRole: () => {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    return user.role || localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || 'user';
  },
  
  isAdmin: () => {
    const role = authService.getUserRole();
    return role === 'admin' || role === 'superadmin';
  },
  
  refreshToken: () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      return Promise.reject(new Error('No token available to refresh'));
    }
    
    console.log('Token refresh requested - using current token as fallback');
    
    return Promise.resolve({
      data: {
        token: token
      }
    });
  },
};

export default authService;