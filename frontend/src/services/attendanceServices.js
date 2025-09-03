import api from './api';
import ToastHelper from '../components/ToastHelper';

const attendanceService = {
  markAttendanceQR: async (qrData) => {
    try {
      let scanData;

      if (typeof qrData === 'object') {
        scanData = {
          qrData,
          deviceInfo: navigator.userAgent,
          scanLocation: 'QR Scanner'
        };
      } else {
        const isNumericFormat = /^\d{4}(\s+\d{4}){7}$/.test(qrData.trim());

        if (isNumericFormat) {
          scanData = {
            qrData: qrData.trim(),
            deviceInfo: navigator.userAgent,
            scanLocation: 'QR Scanner'
          };
        } else {
          scanData = {
            qrData: { studentId: qrData.trim() },
            deviceInfo: navigator.userAgent,
            scanLocation: 'QR Scanner',
            rawCode: qrData.trim()
          };
        }
      }

      const response = await api.post('/qr/markAttendanceQR', scanData);

      if (response.data?.success) {
        const status = response.data.data?.attendance?.status || 'present';
        const studentName = response.data.data?.student?.name || 'Student';
        ToastHelper.success(`Attendance marked: ${studentName} ${status === 'entered' ? 'entered' : status === 'left' ? 'left' : status}`);
      }

      return response.data;

    } catch (error) {
      console.error('Error marking QR attendance:', error);
<<<<<<< HEAD

      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data?.message?.includes('student') &&
            error.response.data?.message?.includes('not found')) {
=======
      
      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data?.message?.includes('student') && 
              error.response.data?.message?.includes('not found')) {
>>>>>>> fa105640cd26f67cd3fa296c5e378275579c2c7e
            ToastHelper.error('Student not found. Please check the QR code and try again.');
          } else if (error.response.data?.message?.includes('Invalid QR code')) {
            ToastHelper.error('Invalid QR code format. Please try another QR code.');
          } else {
            ToastHelper.error(error.response.data?.message || 'Invalid QR code data');
          }
        } else if (error.response.status === 404) {
          ToastHelper.error('Student not found. Please check the QR code and try again.');
        } else {
          ToastHelper.error(error.response.data?.message || 'Failed to process QR code');
        }
      } else if (error.request) {
        ToastHelper.error('No response from server. Please check your connection and try again.');
      } else {
        ToastHelper.error('Error processing QR code. Please try again later.');
      }

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to process QR code',
        errorType: error.response?.status === 404 ||
          (error.response?.data?.message && error.response?.data?.message.includes('not found'))
          ? 'student_not_found' : 'unknown_error'
      };
    }
  },

  // Auto Checkout Configuration
  configureAutoCheckout: async (settings) => {
    try {
      const response = await api.post('/attendance/auto-checkout/configure', settings);
      ToastHelper.success('Auto-checkout settings updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error configuring auto-checkout:', error);
      ToastHelper.error(error.response?.data?.message || 'Failed to update auto-checkout settings');
      throw error;
    }
  },

  getAutoCheckoutSettings: async () => {
    try {
      const response = await api.get('/attendance/auto-checkout/settings');
      return response.data;
    } catch (error) {
      console.error('Error getting auto-checkout settings:', error);
      return {
        enabled: false,
        time: '18:30',
        sendNotification: true
      };
    }
  },

  runAutoCheckout: async () => {
    try {
      const response = await api.post('/attendance/auto-checkout/run');
      const { processed, failed } = response.data;
      ToastHelper.success(`Auto-checkout completed: ${processed} students processed, ${failed} failed`);
      return response.data;
    } catch (error) {
      console.error('Error running auto-checkout:', error);
      ToastHelper.error(error.response?.data?.message || 'Failed to run auto-checkout');
      throw error;
    }
  },

  // Check previous day attendance
  checkPreviousDayAttendance: async () => {
    try {
      const response = await api.post('/whatsapp/check-previous');
      ToastHelper.success('Previous day attendance check completed');
      return response.data;
    } catch (error) {
      console.error('Error checking previous day attendance:', error);
      ToastHelper.error('Failed to check previous day attendance');
      throw error;
    }
  },

  // Attendance Queries
  getTodayAttendance: async () => {
    try {
      const response = await api.get('/attendance/today');

      if (response.data?.data) {
        return {
          students: response.data.data.students || [],
          stats: response.data.data.stats || {}
        };
      }
<<<<<<< HEAD

=======
      
>>>>>>> fa105640cd26f67cd3fa296c5e378275579c2c7e
      return {
        students: response.data?.students || [],
        stats: response.data?.stats || {}
      };
    } catch (error) {
      console.error('Error getting today\'s attendance:', error);
      ToastHelper.error('Failed to load attendance data');
      return { students: [], stats: {} };
    }
  },

  getRecentAttendance: async () => {
    try {
      const response = await api.get('/attendance/today');
<<<<<<< HEAD

=======
      
>>>>>>> fa105640cd26f67cd3fa296c5e378275579c2c7e
      if (response.data?.data) {
        return {
          students: response.data.data.students || [],
          stats: response.data.data.stats || {}
        };
      }
<<<<<<< HEAD

=======
      
>>>>>>> fa105640cd26f67cd3fa296c5e378275579c2c7e
      return {
        students: response.data?.students || [],
        stats: response.data?.stats || {}
      };
    } catch (error) {
      console.error('Error getting recent attendance:', error);

      // Don't show toast for authentication errors since api.js will handle the redirect
      if (!error.response || error.response.status !== 401) {
        ToastHelper.error('Failed to load attendance data');
      }

      return { students: [], stats: {} };
    }
  },

  getAttendanceByDate: async (date) => {
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const response = await api.get(`/attendance/${formattedDate}`);
<<<<<<< HEAD

=======
      
>>>>>>> fa105640cd26f67cd3fa296c5e378275579c2c7e

      if (response.data?.data) {
        return {
          students: response.data.data.students || [],
          stats: response.data.data.stats || {}
        };
      }
<<<<<<< HEAD

=======
      
>>>>>>> fa105640cd26f67cd3fa296c5e378275579c2c7e
      return {
        students: response.data?.students || [],
        stats: response.data?.stats || {}
      };
    } catch (error) {
      console.error('Error getting attendance by date:', error);
      ToastHelper.error('Failed to load attendance data');
      return { students: [], stats: {} };
    }
  },

  // Student Attendance History
  getStudentAttendanceHistory: async (studentId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api.get(`/attendance/student/${studentId}/history?${queryParams.toString()}`);
      const data = response.data?.data || response.data;
      return {
        student: data?.student || null,
        attendanceHistory: data?.attendanceHistory || [],
        stats: data?.stats || {},
        totalRecords: data?.totalRecords || 0
      };
    } catch (error) {
      console.error('Error getting student attendance history:', error);
      throw error;
    }
  },

  clearAttendanceHistory: async (studentId) => {
    try {
      if (!window.confirm('Are you sure you want to clear all attendance history for this student? This action cannot be undone.')) {
        return { cancelled: true };
      }

      const response = await api.delete(`/attendance/student/${studentId}/clear`);
      ToastHelper.success('Successfully cleared attendance history');
      return response.data;
    } catch (error) {
      console.error('Error clearing attendance history:', error);
      ToastHelper.error('Failed to clear attendance history');
      throw error;
    }
  },

  deleteAttendanceRecord: async (studentId, recordId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
        return { cancelled: true };
      }

      const response = await api.delete(`/attendance/student/${studentId}/record/${recordId}`);
      ToastHelper.success('Successfully deleted attendance record');
      return response.data;
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      ToastHelper.error('Failed to delete attendance record');
      throw error;
    }
  },

  // Dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/students/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  },

  // Utility Functions
  getFormattedDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  },

  getDateRange: (startDate, endDate) => {
    return {
      startDate: attendanceService.getFormattedDate(startDate),
      endDate: attendanceService.getFormattedDate(endDate)
    };
  },

  canCheckOut: (student) => {
    if (!student) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRecord = student.attendanceHistory?.find(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    return todayRecord &&
      (todayRecord.status === 'entered' || todayRecord.status === 'present') &&
      !todayRecord.leaveTime;
  },

  get: (url, config = {}) => api.get(url, config),
  getAllStudents: () => api.get('/admin/students'),

  // Send WhatsApp notification for attendance
  sendWhatsAppNotification: async (studentId, attendanceId, status) => {
    try {
      // First check if we have necessary data
      if (!studentId) {
        console.error('Missing student ID for WhatsApp notification');
        return { success: false, error: 'Missing student ID' };
      }

      // Create the payload with available data
      const payload = {
        studentId,
        attendanceId,
        status: status || 'present',
        timestamp: new Date().toISOString()
      };

      // Send the notification
      const response = await api.post('/whatsapp/send-attendance-notification', payload);

      if (response.data?.success) {
        ToastHelper.success('WhatsApp notification sent successfully');
        return {
          success: true,
          data: response.data
        };
      } else {
        ToastHelper.warning(response.data?.message || 'WhatsApp notification status unknown');
        return {
          success: false,
          error: response.data?.message || 'Unknown status',
          data: response.data
        };
      }
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);

      // Don't show toast for authentication errors since they're handled in api.js
      if (!error.response || error.response.status !== 401) {
        ToastHelper.error(error.response?.data?.message || 'Failed to send WhatsApp notification');
      }

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send WhatsApp notification'
      };
    }
  },
};

export default attendanceService;
