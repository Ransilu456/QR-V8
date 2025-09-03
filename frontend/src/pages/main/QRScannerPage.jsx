import QRScanner from '../../components/scanner/QRScanner';
import StudentQRCode from '../../components/scanner/StudentQRCode';
import DigitalQRScanner from '../../components/scanner/DigitalQRScanner';
import ScannedStudentInfo from '../../components/scanner/ScannedStudentInfo';

import { DateTime } from 'luxon';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { attendanceService } from '../../services';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import ToastHelper from '../../components/ToastHelper';


const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const QRScannerPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [recentAttendance, setRecentAttendance] = useState({ students: [], stats: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);


  const fetchRecentAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (typeof attendanceService.getRecentAttendance !== 'function') {
        console.error('Error: attendanceService.getRecentAttendance is not a function');
        setError('Recent attendance feature is not available');
        setRecentAttendance({ students: [], stats: {} });
        return;
      }

      const response = await attendanceService.getRecentAttendance();

      if (!response.data) {
        setRecentAttendance({ students: [], stats: {} });
        return;
      }

      const processedStudents = (response.data.students || []).map(student => {
        return {
          ...student,
          id: student.id || student._id,
          indexNumber: student.indexNumber?.toUpperCase() || 'N/A',
          displayStatus: student.status === 'entered' ? 'Present' :
            student.status === 'left' ? 'Left' :
              student.status === 'late' ? 'Late' :
                'Absent',
          messageStatus: student.messageStatus || 'pending'
        };
      });

      setRecentAttendance({
        students: processedStudents,
        stats: response.data.stats || {
          totalCount: processedStudents.length,
          presentCount: processedStudents.filter(s => s.status === 'entered').length,
          absentCount: processedStudents.filter(s => s.status === 'absent').length,
          leftCount: processedStudents.filter(s => s.status === 'left').length
        }
      });
    } catch (error) {
      console.error('Error fetching recent attendance:', error);
      ToastHelper.error('Failed to fetch recent attendance');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchRecentAttendance();
    const interval = setInterval(fetchRecentAttendance, 60000);
    return () => clearInterval(interval);
  }, [fetchRecentAttendance]);

  useEffect(() => {
    if (scanSuccess) {
      fetchRecentAttendance();
    }
  }, [scanSuccess, fetchRecentAttendance]);

  // Reset scan result after delay
  useEffect(() => {
    let timer;
    if (scanResult) {
      timer = setTimeout(() => {
        setScanResult(null);
        setScanSuccess(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [scanResult]);

const handleScanSuccess = useCallback(async (result) => {
  try {
    let parsedData = result;
    if (typeof result === 'string') {
      try {
        parsedData = JSON.parse(result);
      } catch (error) {
        console.error('Error parsing scan result:', error);
        throw new Error('Invalid QR code format');
      }
    }

    const student = parsedData.student || parsedData;
    const attendance = parsedData.attendance || {};
    const status = parsedData.status || attendance.current?.status || 'present';

    const whatsappURL =
      parsedData.whatsappURL ||
      (attendance.messages && attendance.messages.length > 0
        ? attendance.messages
            .filter(m => m.type === 'whatsapp')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.url
        : null);

    const displayData = {
      _id: student._id,
      id: student._id || student.id,
      name: student.name,
      indexNumber: student.indexNumber,
      student_email: student.student_email || student.email || 'N/A',
      email: student.student_email || student.email || 'N/A',
      address: student.address || 'N/A',
      status: status.toLowerCase(),
      timestamp: new Date().toISOString(),
      formattedTime: DateTime.now().toLocaleString(DateTime.TIME_SIMPLE),
      attendance: {
        ...attendance,
        current: {
          status: status.toLowerCase(),
          timestamp: new Date().toISOString(),
        },
        whatsappURL: whatsappURL, 
      },
    };

    setScanResult(displayData);
    setScanSuccess(true);

    ToastHelper.success(
      `Attendance marked for ${displayData.name || 'Student'} as ${status}`
    );

    if (displayData.attendance.whatsappURL) {
      window.open(displayData.attendance.whatsappURL, '_blank');
    }

    await fetchRecentAttendance();
  } catch (error) {
    console.error('Error processing scan result:', error);
    ToastHelper.error(error.message || 'Failed to process QR code data');
    setScanSuccess(false);
    setScanResult(null);
  }
}, [fetchRecentAttendance]);

  const handleScanError = useCallback((error) => {
    console.error('Scan error:', error);
    ToastHelper.error(error.message || 'Failed to scan QR code');
    setScanSuccess(false);
    setScanResult(null);
  }, []);


  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">QR Code Scanner</h1>


              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-4 rounded-md ${scanSuccess ? 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-700'} border-l-4`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {scanSuccess ? (
                        <CheckCircle className="h-5 w-5 text-green-400 dark:text-green-300" aria-hidden="true" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" aria-hidden="true" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className={`text-sm font-medium ${scanSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                        {scanSuccess ? 'Attendance Marked Successfully' : 'Scan Error'}
                      </h3>student
                      <div className={`mt-2 text-sm ${scanSuccess ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {scanSuccess ? (
                          <div className="space-y-2">
                            <ScannedStudentInfo student={scanResult} attendance={scanResult.attendance || {}} />
                          </div>
                        ) : (
                          <p>Failed to process QR code. Please try again.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 dark:bg-blue-900/40 p-1">
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                        'ring-white dark:ring-slate-700 ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                        selected
                          ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow'
                          : 'text-blue-100 hover:bg-white/[0.12] hover:text-blue-600 dark:hover:text-blue-300'
                      )
                    }
                  >
                    Camera Scanner
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                        'ring-white dark:ring-slate-700 ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                        selected
                          ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow'
                          : 'text-blue-100 hover:bg-white/[0.12] hover:text-blue-600 dark:hover:text-blue-300'
                      )
                    }
                  >
                    Upload QR Image
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                        'ring-white dark:ring-slate-700 ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                        selected
                          ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow'
                          : 'text-blue-100 hover:bg-white/[0.12] hover:text-blue-600 dark:hover:text-blue-300'
                      )
                    }
                  >
                    Search for QR
                  </Tab>
                </Tab.List>
                <Tab.Panels className="mt-4">
                  <Tab.Panel className={classNames('rounded-xl p-3')}>
                    <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                  </Tab.Panel>
                  <Tab.Panel className={classNames('rounded-xl p-3')}>
                    <DigitalQRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                  </Tab.Panel>
                  <Tab.Panel className={classNames('rounded-xl p-3')}>
                    <StudentQRCode />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default QRScannerPage;