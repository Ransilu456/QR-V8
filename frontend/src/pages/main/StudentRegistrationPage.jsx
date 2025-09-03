import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ToastHelper from "../../components/ToastHelper";
import {
  AlertCircle,
  Info,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import { studentService, qrCodeService } from "../../services";

const StudentRegistrationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    indexNumber: "",
    address: "",
    student_email: "",
    parent_email: "",
    parent_telephone: "",
    age: 0,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    name: false,
    indexNumber: false,
    address: false,
    student_email: false,
    parent_email: false,
    parent_telephone: false,
    age: false,
  });
  const [apiError, setApiError] = useState("");
  const [registeredStudent, setRegisteredStudent] = useState(null);
  const [qrValue, setQrValue] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  // Register student
  const registerStudent = async (e) => {
    e.preventDefault();

    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      ToastHelper.error("Please fix the errors in the form before submitting");
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      console.log("Submitting form data:", formData);

      const response = await studentService.registerStudent(formData);
      console.log("Registration response:", response);

      // Success path - handle valid response
      ToastHelper.success("Student registered successfully");
      
      // Log the structure of the response to debug
      console.log("Response structure:", {
        hasDataProp: response?.data !== undefined,
        directProps: Object.keys(response || {}),
        nestedProps: Object.keys(response?.data || {})
      });
      
      // Immediately set QR value from response if available
      if (response?.data?.qrCode) {
        console.log("Found QR code in response.data.qrCode");
        setQrValue(response.data.qrCode);
        setQrLoading(false);
      } else if (response?.qrCode) {
        console.log("Found QR code directly in response.qrCode");
        setQrValue(response.qrCode);
        setQrLoading(false);
      } else if (response?.data?.qrCodeUrl) {
        console.log("Found QR code in response.data.qrCodeUrl");
        setQrValue(response.data.qrCodeUrl);
        setQrLoading(false);
      } else if (response?.qrCodeUrl) {
        console.log("Found QR code directly in response.qrCodeUrl");
        setQrValue(response.qrCodeUrl);
        setQrLoading(false);
      } else if (response?.data?.student?.qrCode) {
        console.log("Found QR code in response.data.student.qrCode");
        setQrValue(response.data.student.qrCode);
        setQrLoading(false);
      } else if (response?.student?.qrCode) {
        console.log("Found QR code in response.student.qrCode");
        setQrValue(response.student.qrCode);
        setQrLoading(false);
      }
      
      // Extract student data from the response - check both possible locations
      let studentData = response?.data?.student || response?.student || null;
      if (studentData) {
        console.log("Student data extracted successfully:", studentData);
      } else {
        console.warn("No student data found in response - will use form data");
        // Fallback to form data with ID from response if available
        studentData = {
          ...formData,
          _id: response?.data?.student?._id || response?.student?._id || null
        };
      }
      
      // Always proceed to step 2 on successful registration
      console.log("Setting registered student and moving to step 2");
      setRegisteredStudent(studentData);
      setStep(2);
    } catch (error) {
      console.error("Error registering student:", error);
      
      // Check for specific error types
      if (error.response) {
        console.log("Error response:", error.response.data);
        
        // Handle duplicate email error
        if (error.response.data && error.response.data.error && 
            error.response.data.error.code === 11000) {
          setApiError("Email already exists. Please use a different email address.");
          ToastHelper.error("Email already exists. Please use a different email address.");
        } else {
          const errorMessage = error.response.data?.message || 
            "Failed to register student. Please try again.";
          setApiError(errorMessage);
          ToastHelper.error(errorMessage);
        }
      } else {
        setApiError("Network error. Please check your connection and try again.");
        ToastHelper.error("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate QR code data - Only used if we need to fetch QR separately
  const getQRCodeData = useCallback(async () => {
    try {
      const studentId = registeredStudent?._id;
      
      if (!studentId) {
        ToastHelper.error("Student ID is required for QR code generation");
        return null;
      }

      const qrResponse = await qrCodeService.getStudentQRCode(studentId);
      
      if (qrResponse && qrResponse.data) {
        return qrResponse.data;
      } else {
        ToastHelper.error("Failed to retrieve QR code from server");
        return null;
      }
    } catch (error) {
      console.error("Error fetching QR code data:", error);
      ToastHelper.error("Failed to fetch QR code from server");
      return null;
    }
  }, [registeredStudent]);

  useEffect(() => {
    if (registeredStudent && !qrValue) {
      const loadQrData = async () => {
        setQrLoading(true);
        try {
          const data = await getQRCodeData();
          if (data) {
            setQrValue(data);
          } else {
            console.error("Backend QR code generation failed");
            ToastHelper.error("Failed to generate QR code from server");
          }
        } catch (error) {
          console.error("Failed to load QR code data:", error);
          ToastHelper.error("Error retrieving QR code from server");
        } finally {
          setQrLoading(false);
        }
      };
      
      loadQrData();
    }
  }, [registeredStudent, getQRCodeData, qrValue]);

  useEffect(() => {
    if (apiError) {
      setApiError("");
    }
  }, [formData, apiError]);

  const validateField = (name, value) => {
    let newErrors = { ...errors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Student name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else if (value.trim().length > 50) {
          newErrors.name = "Name must be less than 50 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          newErrors.name =
            "Name can only contain letters, spaces, hyphens and apostrophes";
        } else {
          delete newErrors.name;
        }
        break;

      case "indexNumber":
        if (!value.trim()) {
          newErrors.indexNumber = "Index number is required";
        } else if (value.trim().length < 3) {
          newErrors.indexNumber = "Index number must be at least 3 characters";
        } else if (value.trim().length > 20) {
          newErrors.indexNumber =
            "Index number must be less than 20 characters";
        } else {
          delete newErrors.indexNumber;
        }
        break;

      case "student_email":
        if (!value.trim()) {
          newErrors.student_email = "Student email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.student_email = "Please enter a valid email address";
        } else {
          delete newErrors.student_email;
        }
        break;

      case "parent_email":
        if (!value.trim()) {
          newErrors.parent_email = "Parent email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.parent_email = "Please enter a valid email address";
        } else {
          delete newErrors.parent_email;
        }
        break;

      case "parent_telephone":
        if (!value.trim()) {
          newErrors.parent_telephone = "Parent telephone is required";
        } else {
          const cleanNumber = value.replace(/[\s-]/g, "");
          if (!/^\+?\d{10,15}$/.test(cleanNumber)) {
            newErrors.parent_telephone =
              "Phone number must be 10-15 digits with optional + prefix";
          } else {
            delete newErrors.parent_telephone;
          }
        }
        break;

      case "age":
        if (value === undefined || value === null || value === "") {
          newErrors.age = "Age is required";
        } else if (
          isNaN(value) ||
          parseInt(value) < 0 ||
          parseInt(value) > 100
        ) {
          newErrors.age = "Age must be a number between 0 and 100";
        } else {
          delete newErrors.age;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return !newErrors[name];
  };

  const validateForm = () => {
    let tempErrors = {};

    for (const field in formData) {
      if (!validateField(field, formData[field])) {
        tempErrors[field] = errors[field];
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  // Download QR code
  const downloadQRCode = () => {
    if (!qrValue) {
      ToastHelper.error("QR code data is not available. Please make sure the student is properly registered on the server.");
      return;
    }
    
    try {
      if (typeof qrValue === 'string' && !isNaN(qrValue)) {
        const blob = new Blob([`Student QR Code: ${qrValue}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `qrcode-${
          registeredStudent?.name || formData.name
        }.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        ToastHelper.success("QR Code saved successfully");
        return;
      }
      
      let image;
      
      if (qrValue.startsWith('data:image')) {
        image = qrValue;
      } else {
        const canvas = document.getElementById("student-qr-code");
        if (!canvas) {
          ToastHelper.error("QR code canvas not found. Please try refreshing the page.");
          return;
        }
        image = canvas.toDataURL("image/png");
      }
      
      const link = document.createElement("a");
      link.href = image;
      link.download = `qrcode-${
        registeredStudent?.name || formData.name
      }.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      ToastHelper.success("QR Code downloaded successfully");
    } catch (error) {
      console.error("Error downloading QR code:", error);
      ToastHelper.error("Failed to download QR code. Please try again.");
    }
  };

  const registerAnother = () => {
    setFormData({
      name: "",
      indexNumber: "",
      address: "",
      student_email: "",
      parent_email: "",
      parent_telephone: "",
      age: 0,
    });
    setRegisteredStudent(null);
    setErrors({});
    setTouched({
      name: false,
      indexNumber: false,
      address: false,
      student_email: false,
      parent_email: false,
      parent_telephone: false,
      age: false,
    });
    setApiError("");
    setStep(1);
  };

  const renderTextField = (
    name,
    label,
    type = "text",
    required = false,
    placeholder = "",
    autoComplete = ""
  ) => (
    <div className="col-span-1">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          id={name}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={formData[name]}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`transition-all duration-200 shadow-sm block w-full sm:text-sm rounded-lg border p-2.5 ${
            errors[name] && touched[name]
              ? "border-red-300 dark:border-red-600 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-500 focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700"
              : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-500"
          }`}
        />
        {touched[name] && !errors[name] && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckCircle
              className="h-5 w-5 text-green-500"
              aria-hidden="true"
            />
          </div>
        )}
        {errors[name] && touched[name] && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {errors[name] && touched[name] ? (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errors[name]}
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 h-4">
          &nbsp;
        </p>
      )}
    </div>
  );

  const pageVariants = {
    initial: { opacity: 0, x: "100%" },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: "-100%" },
  };

  const pageTransition = {
    type: "tween",
    duration: 0.3,
  };

  return (
    <div className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Student Registration
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Register a new student and generate their attendance QR code
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center">
            <div className="flex items-center relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                1
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 absolute -bottom-7 w-24 text-center">
                Student Info
              </div>
            </div>
            <div
              className={`h-1 w-32 transition-all duration-500 ${
                step >= 2 ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            ></div>
            <div className="flex items-center relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                2
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 absolute -bottom-7 w-24 text-center">
                QR Code
              </div>
            </div>
          </div>
        </motion.div>

        {/* API Error Message */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4 rounded-md shadow-sm"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle
                  className="h-5 w-5 text-red-400 dark:text-red-500"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {apiError}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          {step === 1 ? (
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="px-6 py-8 sm:p-8"
            >
              <form onSubmit={registerStudent} className="space-y-8">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    Personal Information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Enter the student's basic information
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                  {renderTextField(
                    "name",
                    "Full Name",
                    "text",
                    true,
                    "John Doe"
                  )}
                  {renderTextField(
                    "indexNumber",
                    "Index Number",
                    "text",
                    true,
                    "S12345"
                  )}
                  {renderTextField(
                    "student_email",
                    "Student Email",
                    "email",
                    true,
                    "student@example.com",
                    "email"
                  )}
                  {renderTextField(
                    "address",
                    "Address",
                    "text",
                    false,
                    "123 Street, City",
                    "street-address"
                  )}
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    Parent/Guardian Information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Enter parent or guardian contact details
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                  {renderTextField(
                    "parent_email",
                    "Parent Email",
                    "email",
                    true,
                    "parent@example.com",
                    "email"
                  )}
                  {renderTextField(
                    "parent_telephone",
                    "Parent Telephone",
                    "tel",
                    true,
                    "+94XXXXXXXXXX",
                    "tel"
                  )}
                  {renderTextField("age", "Age", "number", true, "")}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
                    <span>
                      Fields marked with <span className="text-red-500">*</span>{" "}
                      are required
                    </span>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => navigate("/students")}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" />
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading || Object.keys(errors).length > 0}
                      className={`inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition-all duration-200 ${
                        loading || Object.keys(errors).length > 0
                          ? "bg-blue-300 dark:bg-blue-400/50 cursor-not-allowed"
                          : "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Registering...
                        </>
                      ) : (
                        <>
                          Register Student
                          <ArrowRight className="h-4 w-4 ml-1.5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="px-6 py-8 sm:p-8"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-green-600 dark:text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                  Registration Successful!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Student has been registered successfully. You can now download
                  their QR code.
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex-1"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Student Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-100 dark:border-gray-600 shadow-sm">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                          {registeredStudent?.name || formData.name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Index Number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                          {registeredStudent?.indexNumber ||
                            formData.indexNumber}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Email
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                          {registeredStudent?.student_email ||
                            formData.student_email}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                          {registeredStudent?.address || formData.address}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Age
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                          {registeredStudent?.age || formData.age}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Registration Date
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                          {new Date().toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="p-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm mb-4">
                    {qrLoading ? (
                      <div className="flex items-center justify-center" style={{ width: '220px', height: '220px' }}>
                        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : qrValue ? (
                      qrValue.startsWith('data:image') ? (
                        // Direct image rendering for base64 data from backend
                        <img 
                          id="student-qr-code"
                          src={qrValue} 
                          alt="Student QR Code" 
                          width={220} 
                          height={220} 
                          style={{ maxWidth: '100%' }}
                        />
                      ) : (
                        // Either display numeric code or generate QR from backend data
                        typeof qrValue === 'string' && !isNaN(qrValue) ? (
                          <div className="flex flex-col items-center justify-center" style={{ width: '220px', height: '220px' }}>
                            <p className="text-2xl font-bold text-center mb-2">QR Code</p>
                            <p className="text-xl text-center">{qrValue}</p>
                          </div>
                        ) : (
                          // Use QRCodeCanvas only if backend returns data to render
                          <QRCodeCanvas
                            id="student-qr-code"
                            value={qrValue}
                            size={220}
                            level="H"
                            includeMargin={true}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                          />
                        )
                      )
                    ) : (
                      <div className="flex items-center justify-center" style={{ width: '220px', height: '220px' }}>
                        <AlertCircle className="h-10 w-10 text-red-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs text-center mb-5">
                    This QR code contains the student's information and can be
                    used for attendance tracking.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadQRCode}
                    disabled={qrLoading || !qrValue}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Download QR Code
                  </motion.button>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 inline mr-1" />
                  You can share this QR code with the student for attendance
                  marking.
                </p>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => navigate("/students")}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Back to Students
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={registerAnother}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                  >
                    Register Another
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRegistrationPage;
