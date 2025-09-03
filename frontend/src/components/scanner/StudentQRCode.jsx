import { useState, useRef, useEffect, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import studentService from '../../services/studentService';
import qrCodeService from '../../services/qrCodeService';
import ToastHelper from '../../components/ToastHelper';
import { motion } from 'framer-motion';
import { 
  Search, 
  AlertCircle, 
  X, 
  Download,
  User,
  QrCode,
  Copy,
  Check
} from 'lucide-react';

const StudentQRCode = () => {
  const [studentData, setStudentData] = useState({
    name: '',
    indexNumber: '',
    student_email: '',
    phone: '',
    address: ''
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const searchTimeoutRef = useRef(null);
  const qrRef = useRef();

  const searchStudent = useCallback(async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      return;
    }
    
    try {
      setSearchLoading(true);
      setSearchResults([]);
      
      let response;
      
      if (/\d/.test(searchTerm) || /^[A-Z]+\d+$/i.test(searchTerm)) {
        console.log('Searching using index number pattern');
        try {
          response = await studentService.getStudentsByIndexNumber(searchTerm);
        } catch (err) {
          response = await studentService.getAllStudents();
        }
      } else {
        response = await studentService.getAllStudents();
      }
      
      const students = response?.data?.students || response?.students || [];

      const searchTermLower = searchTerm.toLowerCase();
      
      const filteredStudents = students
        .map(student => {
          let score = 0;
          
          const nameLower = (student.name || '').toLowerCase();
          if (nameLower === searchTermLower) score += 100;
          else if (nameLower.startsWith(searchTermLower)) score += 75;
          else if (nameLower.includes(searchTermLower)) score += 50;
          
          const indexLower = (student.indexNumber || '').toLowerCase();
          if (indexLower === searchTermLower) score += 90;
          else if (indexLower.startsWith(searchTermLower)) score += 70;
          else if (indexLower.includes(searchTermLower)) score += 40;
          
          const emailLower = (student.student_email || '').toLowerCase();
          if (emailLower === searchTermLower) score += 60;
          else if (emailLower.startsWith(searchTermLower)) score += 30;
          else if (emailLower.includes(searchTermLower)) score += 20;
          
          return { ...student, score };
        })
        .filter(student => student.score > 0)
        .sort((a, b) => b.score - a.score);
      
      setSearchResults(filteredStudents);
      setShowSearchResults(true);
      
      if (filteredStudents.length === 0) {
        ToastHelper.info('No students found with that search term');
      }
    } catch (error) {
      console.error('Error searching students:', error);
      ToastHelper.error('Failed to search students');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchTerm.trim().length >= 2) {
      setSearchLoading(true);
      searchTimeoutRef.current = setTimeout(() => {
        searchStudent();
      }, 300);
    } else if (searchTerm === '') {
      setShowSearchResults(false);
      setSearchResults([]);
      setSearchLoading(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchStudent]);

  const handleSelectStudent = (student) => {
    setStudentData({
      _id: student._id,
      name: student.name || '',
      indexNumber: student.indexNumber || '',
      student_email: student.student_email || '',
      phone: student.phone || '',
      address: student.address || ''
    });
    setShowSearchResults(false);
    setSearchTerm('');
    setQrError('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const downloadQRCode = async () => {
    if (!studentData._id) {
      ToastHelper.error('Please select a student first');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      const response = await qrCodeService.downloadQRCode(studentData._id);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `QR-code-${studentData.name}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      ToastHelper.success('QR Code downloaded successfully');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      ToastHelper.error('Failed to download QR code');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyQRCode = () => {
    if (!studentData._id) {
      ToastHelper.error('Please select a student first');
      return;
    }
    
    try {
      if (qrRef.current) {
        if (qrImage) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (blob) => {
              const item = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([item]);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
              ToastHelper.success('QR Code copied to clipboard');
            });
          };
          img.src = qrImage;
        } else {
          const canvas = qrRef.current.querySelector('canvas');
          if (canvas) {
            canvas.toBlob(async (blob) => {
              const item = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([item]);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
              ToastHelper.success('QR Code copied to clipboard');
            });
          } else {
            ToastHelper.error('Could not find QR code canvas');
          }
        }
      }
    } catch (error) {
      console.error('Error copying QR code:', error);
      ToastHelper.error('Failed to copy QR code. Your browser may not support this feature.');
    }
  };

  useEffect(() => {
    if (studentData._id) {
      const fetchQrCodeData = async () => {
        setQrLoading(true);
        setQrError('');
        setQrValue('');
        setQrImage('');
        
        try {
          const qrResponse = await qrCodeService.getStudentQRCode(studentData._id);
          
          if (qrResponse) {
            if (qrResponse.imageFound && qrResponse.data.qrImage) {
              setQrImage(qrResponse.data.qrImage);
              console.log('QR image loaded from server');
            } 
            else if (qrResponse.data && typeof qrResponse.data === 'string' && qrResponse.data.startsWith('data:image')) {
              setQrImage(qrResponse.data);
              console.log('QR image string loaded from server');
            }
            else if (qrResponse.data) {
              const dataString = typeof qrResponse.data === 'string' 
                ? qrResponse.data 
                : JSON.stringify(qrResponse.data);
              
              if (dataString.length > 2000) {
                console.warn('QR data too long for encoding:', dataString.length);
                setQrError('QR code data is too large to display. Please contact an administrator.');
                ToastHelper.error('QR code data is too large');
              } else {
                setQrValue(dataString);
                console.log('QR data loaded from server');
              }
            } else {
              setQrError('No QR code available. Contact an administrator to generate one.');
              ToastHelper.warning('QR code not found for this student.');
            }
          } else {
            setQrError('No QR code available. Contact an administrator to generate one.');
            ToastHelper.warning('QR code not found for this student.');
          }
        } catch (error) {
          console.error('Error fetching QR code data:', error);
          
          if (error.response?.status === 404) {
            setQrError('No QR code found. Please contact an administrator.');
            ToastHelper.warning('QR code not available for this student');
          } else {
            setQrError('Failed to retrieve QR code. Please try again later.');
            ToastHelper.error('Error retrieving QR code');
          }
        } finally {
          setQrLoading(false);
        }
      };
      
      fetchQrCodeData();
    }
  }, [studentData]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <QrCode className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
            Search for Student QR Code
          </h2>
          
          <div className="relative">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Search by name, index number, or email..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchLoading && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="animate-spin h-5 w-5 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {searchTerm && !searchLoading && (
              <button 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {showSearchResults && searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 divide-y divide-gray-200 dark:divide-slate-700"
            >
              {searchResults.map((student) => (
                <div 
                  key={student._id || student.indexNumber}
                  className="p-3 flex items-center hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition duration-150 ease-in-out"
                  onClick={() => handleSelectStudent(student)}
                >
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                        {student.name}
                      </p>
                      {student.score > 80 && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                          Best Match
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">ID: {student.indexNumber}</span>
                      {student.student_email && (
                        <span className="truncate max-w-xs">{student.student_email}</span>
                      )}
                    </div>
                    {student.address && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                        {student.address}
                      </p>
                    )}
                  </div>
                  <div className="ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {showSearchResults && searchResults.length === 0 && !searchLoading && searchTerm && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg text-center text-gray-600 dark:text-gray-300">
              No students found matching '{searchTerm}'
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {studentData.name && studentData.indexNumber ? 'Student QR Code' : 'Selected Student QR Code'}
          </h2>
          
          {studentData.name && studentData.indexNumber ? (
            <>
              <div className="mb-4 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                  {studentData.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {studentData.indexNumber}
                </p>
                {studentData.student_email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {studentData.student_email}
                  </p>
                )}
              </div>
              
              <div 
                ref={qrRef}
                className="bg-white p-3 rounded-xl shadow-lg border-2 border-gray-100 dark:border-slate-700 mb-5"
              >
                {qrLoading ? (
                  <div className="flex items-center justify-center" style={{ width: '220px', height: '220px' }}>
                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : qrImage ? (
                  <div style={{ width: '220px', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img 
                      src={qrImage} 
                      alt="Student QR Code" 
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  </div>
                ) : qrValue ? (
                  <QRCodeCanvas
                    id="qrCode"
                    value={qrValue}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center" style={{ width: '220px', height: '220px' }}>
                    <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
                    {qrError && <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-2">{qrError}</p>}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <button
                  onClick={downloadQRCode}
                  disabled={isDownloading || qrLoading || (!qrValue && !qrImage)}
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Download QR Code
                    </>
                  )}
                </button>
                
                <button
                  onClick={copyQRCode}
                  disabled={qrLoading || (!qrValue && !qrImage)}
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center p-8 flex flex-col items-center">
              <div className="bg-gray-100 dark:bg-slate-700 rounded-full p-6 mb-4">
                <QrCode className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Search and select a student above to generate their QR code
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentQRCode; 