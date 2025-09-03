import api from './api';
import ToastHelper from '../components/ToastHelper';

const studentService = {
  
  getAllStudents: async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        ToastHelper.error('Authentication required. Please log in again.');
        return { students: [] };
      }

      const response = await api.get('/admin/students/all');
      return response.data;
    } catch (error) {
      console.error('Error getting all students:', error);

      if (error.response) {
        if (error.response.status === 401) {
          ToastHelper.error('Authentication required. Please log in again.');
        } else if (error.response.status === 403) {
          ToastHelper.error('You do not have permission to access student data.');
        } else {
          ToastHelper.error('Failed to load students. Please try again later.');
        }
      } else {
        ToastHelper.error('Network error. Please check your connection.');
      }

      return { students: [] };
    }
  },

  getStudents: async (params = {}) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        ToastHelper.error('Authentication required. Please log in again.');
        return { students: [] };
      }

      const response = await api.get('/admin/students', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting students:', error);

      if (error.response) {
        if (error.response.status === 401) {
          ToastHelper.error('Authentication required. Please log in again.');
        } else if (error.response.status === 403) {
          ToastHelper.error('You do not have permission to access student data.');
        } else {
          ToastHelper.error('Failed to load students. Please try again later.');
        }
      } else {
        ToastHelper.error('Network error. Please check your connection.');
      }

      return { students: [] };
    }
  },

  getStudentsByIndexNumber: async (indexNumber) => {
    try {
      const params = { indexNumber: indexNumber.trim() };
      const response = await api.get('/admin/students', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting students by index number:', error);
      throw error;
    }
  },

  registerStudent: async (data) => {
    try {
      const formattedData = {
        ...data,
        indexNumber: data.indexNumber?.toUpperCase(),
        parent_telephone: data.parent_telephone?.trim()
      };

      const response = await api.post('/admin/students', formattedData);
      ToastHelper.success('Student registered successfully');

      if (response.data?.qrCode) {
        return {
          ...response.data,
          qrCodeUrl: response.data.qrCode
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error registering student:', error);
      ToastHelper.error(error.response?.data?.message || 'Failed to register student');
      throw error;
    }
  },

  updateStudent: async (id, data) => {
    try {
      const formattedData = {
        ...data
      };

      if (data.indexNumber) {
        formattedData.indexNumber = data.indexNumber.toUpperCase();
      }

      if (data.parent_telephone) {
        formattedData.parent_telephone = data.parent_telephone.trim();
      }

      const response = await api.put(`/admin/students/${id}`, formattedData);
      ToastHelper.success('Student updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      ToastHelper.error(error.response?.data?.message || 'Failed to update student');
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {

      const response = await api.delete(`/admin/students/${id}`);
      ToastHelper.success('Student deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      ToastHelper.error(error.response?.data?.message || 'Failed to delete student');
      throw error;
    }
  },

  getStudentProfile: async (studentId) => {
    try {
      const response = await api.get(`/students/profile/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting student profile:', error);
      throw error;
    }
  },

  updateStudentProfile: async (studentId, data) => {
    try {
      const response = await api.patch(`/students/profile/${studentId}`, data);
      ToastHelper.success('Student profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating student profile:', error);
      ToastHelper.error(error.response?.data?.message || 'Failed to update student profile');
      throw error;
    }
  },

  generateStudentQRCode: async (studentId) => {
    try {
      const response = await api.get(`/admin/students/${studentId}/qr-code`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },

  getStudentQRByIndex: async (indexNumber) => {
    try {
      if (!indexNumber) {
        throw new Error('Index number is required');
      }

      const response = await api.get(`/admin/students/qr-code/${indexNumber}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error getting QR code by index number:', error);
      throw error;
    }
  },

  getStudentAttendanceHistory: async (studentId, params = {}) => {
    try {
      if (!studentId) {
        console.error('Missing studentId in getStudentAttendanceHistory');
        ToastHelper.error('Invalid student ID');
        return {
          student: null,
          attendanceHistory: [],
          stats: {
            totalCount: 0,
            presentCount: 0,
            absentCount: 0,
            leftCount: 0,
            attendancePercentage: 0
          },
          totalRecords: 0
        };
      }

      console.log(`Fetching attendance history for student ID: ${studentId}`, params);

      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      try {
        const response = await api.get(`/attendance/student/${studentId}/history?${queryParams.toString()}`);
        console.log('Attendance history response:', response.data);

        if (response.data?.success) {
          const data = response.data.data || {};
          return {
            student: data.student || null,
            attendanceHistory: data.attendanceHistory || [],
            stats: data.stats || {
              totalCount: 0,
              presentCount: 0,
              absentCount: 0,
              leftCount: 0,
              attendancePercentage: 0
            },
            totalRecords: data.totalRecords || 0
          };
        }
      } catch (primaryError) {
        console.warn('Primary endpoint failed, trying fallback:', primaryError);
      }

      const response = await api.get(`/students/attendance-history/${studentId}?${queryParams.toString()}`);
      const data = response.data?.data || response.data;

      return {
        student: data?.student || null,
        attendanceHistory: data?.attendanceHistory || [],
        stats: data?.stats || {
          totalCount: 0,
          presentCount: 0,
          absentCount: 0,
          leftCount: 0,
          attendancePercentage: 0
        },
        totalRecords: data?.totalRecords || 0
      };
    } catch (error) {
      console.error('Error getting student attendance history:', error);
      ToastHelper.error('Failed to load attendance history');
      return {
        student: null,
        attendanceHistory: [],
        stats: {
          totalCount: 0,
          presentCount: 0,
          absentCount: 0,
          leftCount: 0,
          attendancePercentage: 0
        },
        totalRecords: 0
      };
    }
  },

  clearAttendanceHistory: async (studentId) => {
    try {
      if (!studentId) {
        console.error('Missing studentId in clearAttendanceHistory');
        ToastHelper.error('Invalid student ID');
        return { success: false, message: 'Invalid student ID' };
      }

      if (!window.confirm('Are you sure you want to clear all attendance history for this student? This action cannot be undone.')) {
        return { cancelled: true };
      }

      const response = await api.delete(`/attendance/student/${studentId}/clear`);
      ToastHelper.success('Successfully cleared attendance history');
      return response.data;
    } catch (error) {
      console.error('Error clearing attendance history:', error);
      ToastHelper.error('Failed to clear attendance history');
      return { success: false, error: error.message };
    }
  },

  deleteAttendanceRecord: async (studentId, recordId) => {
    try {
      console.log("Attempting deleteAttendanceRecord for", studentId, recordId);

      if (!studentId || !recordId) {
        ToastHelper.error('Invalid parameters');
        return { success: false, message: 'Invalid parameters' };
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        ToastHelper.error('You must be logged in to delete attendance records');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        return { success: false, message: 'Authentication required' };
      }

      if (!window.confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
        return { cancelled: true };
      }

      const response = await api.delete(
        `/attendance/student/${studentId}/record/${recordId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      return { success: true, data: response.data };

    } catch (error) {
      console.error('Error deleting attendance record:', error);

      let message = 'Failed to delete attendance record';
      if (error.response?.status === 401) {
        message = 'Authentication required to delete attendance records';
      } else if (error.response?.status === 403) {
        message = 'You don’t have permission to delete attendance records';
      }

      ToastHelper.error(message);
      return { success: false, message };
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/students/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  },

  searchStudents: async (searchTerm, options = {}) => {
    try {
      const params = {
        search: searchTerm,
        ...options
      };

      const response = await api.get('/admin/students/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  }
};

export default studentService;