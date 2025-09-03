import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { lazy, Suspense, Component } from "react";
import React from "react";

// Layout
import MainLayout from "./layouts/MainLayout";

// Create a loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

// Create an error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4 rounded-md">
            <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-red-600 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => {
                // Clear errors and try to recover
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go back to home page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import with special handling for network errors
const safeImport = (importFn) => {
  return () => importFn().catch(error => {
    console.error("Module loading error:", error);
    // Return a minimal fallback component
    return {
      default: () => (
        <div className="p-4">
          <h2 className="text-xl text-red-600 mb-2">Failed to load module</h2>
          <p>Please check your internet connection and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      )
    };
  });
};

// Lazy load pages
// Auth Pages
const LoginPage = lazy(safeImport(() => import("./pages/auth/LoginPage")));
{/*const RegisterPage = lazy(safeImport(() => import("./pages/auth/RegisterPage")));*/}
const ForgotPasswordPage = lazy(safeImport(() => 
  import("./pages/auth/ForgotPasswordPage")
));
const ResetPasswordPage = lazy(safeImport(() => import("./pages/auth/ResetPasswordPage")));

// Home Page
const HomePage = lazy(safeImport(() => import("./pages/home/HomePage")));

// Main Dashboard Pages
const DashboardPage = lazy(safeImport(() => import("./pages/main/DashboardPage")));
const StudentsPage = lazy(safeImport(() => import("./pages/main/StudentsPage")));
const AttendanceByDatePage = lazy(safeImport(() =>
  import("./pages/main/AttendanceByDatePage")
));
const AttendanceHistoryPage = lazy(safeImport(() =>
  import("./pages/main/AttendanceHistoryPage")
));
const QRScannerPage = lazy(safeImport(() => import("./pages/main/QRScannerPage")));
const SettingsPage = lazy(safeImport(() => import("./pages/main/SettingsPage")));
const StudentRegistrationPage = lazy(safeImport(() =>
  import("./pages/main/StudentRegistrationPage")
));
const ProfilePage = lazy(safeImport(() => import("./pages/main/ProfilePage")));
{/*const WhatsAppManagementPage = lazy(safeImport(() =>
  import("./pages/main/WhatsAppManagementPage")
));*/}

// Error Pages
const NotFound = lazy(safeImport(() => import("./pages/errors/NotFound")));

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const ThemedToaster = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName="z-50"
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 5000,
        style: {
          background: isDark ? "#1e293b" : "#ffffff",
          color: isDark ? "#f1f5f9" : "#334155",
          border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
          padding: "12px 16px",
          boxShadow: isDark
            ? "0 4px 6px rgba(0, 0, 0, 0.3)"
            : "0 4px 6px rgba(0, 0, 0, 0.1)",
          fontSize: "14px",
          maxWidth: "350px",
        },
        success: {
          iconTheme: {
            primary: isDark ? "#4ade80" : "#10b981",
            secondary: isDark ? "#0f172a" : "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: isDark ? "#f87171" : "#ef4444",
            secondary: isDark ? "#0f172a" : "#ffffff",
          },
        },
        loading: {
          iconTheme: {
            primary: isDark ? "#60a5fa" : "#3b82f6",
            secondary: isDark ? "#0f172a" : "#ffffff",
          },
        },
      }}
    />
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
            <ThemedToaster />
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                 {/* <Route path="/register" element={<RegisterPage />} />*/}
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPasswordPage />}
                  />

                  {/* Redirect routes for direct navigation convenience */}
                  <Route
                    path="/students"
                    element={<Navigate to="/dashboard/students" replace />}
                  />
                  <Route
                    path="/students/register"
                    element={
                      <Navigate to="/dashboard/students/register" replace />
                    }
                  />
                  <Route
                    path="/scanner"
                    element={<Navigate to="/dashboard/scanner" replace />}
                  />
                  <Route
                    path="/attendance"
                    element={<Navigate to="/dashboard/attendance" replace />}
                  />
                  
                  <Route
                    path="attendance/history/:studentId"
                    element={
                        <AttendanceHistoryPage />
                    }
                  />
                 
                  <Route
                    path="/settings"
                    element={<Navigate to="/dashboard/settings" replace />}
                  />
                  <Route
                    path="/profile"
                    element={<Navigate to="/dashboard/profile" replace />}
                  />
                 {/* <Route
                    path="/whatsapp"
                    element={<Navigate to="/dashboard/whatsapp" replace />}
                  />*/}

                  {/* Dashboard Routes - Protected */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route
                      index
                      element={
                        <ProtectedRoute adminOnly>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="students"
                      element={
                        <ProtectedRoute adminOnly>
                          <StudentsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="students/register"
                      element={
                        <ProtectedRoute adminOnly>
                          <StudentRegistrationPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="attendance"
                      element={
                        <ProtectedRoute adminOnly>
                          <AttendanceByDatePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route 
                      path="scanner" 
                      element={
                        <ProtectedRoute>
                          <QRScannerPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="settings"
                      element={
                        <ProtectedRoute adminOnly>
                          <SettingsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                   {/* <Route
                      path="whatsapp"
                      element={
                        <ProtectedRoute adminOnly>
                          <WhatsAppManagementPage />
                        </ProtectedRoute>
                      }
                    />*/}
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
