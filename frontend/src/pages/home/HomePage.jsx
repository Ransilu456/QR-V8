import { useState, useEffect, memo, useMemo } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  UserCircle,
  QrCode,
  BarChart,
  Users,
  Settings,
  LogOut,
  Calendar,
  MessageCircle,
  ChevronRight,
  CheckSquare,
  FileText,
  ArrowRight,
  Star,
  Bell,
  TrendingUp,
  Clock,
  Shield,
  Pencil, Trash,
  Mail,
} from "lucide-react";
import ThemeToggle from "../../components/ui/ThemeToggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart, badge: "New" },
  { name: "Students", href: "/dashboard/students", icon: Users, badge: "8" },
  { name: "QR Scanner", href: "/dashboard/scanner", icon: QrCode, badge: "Scan" },
  { name: "Attendance", href: "/dashboard/attendance", icon: Calendar, badge: "New" },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart, badge: "Updated" }
];

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  }),
  hover: {
    scale: 1.03,
    x: 4,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

const Navbar = memo(() => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 10;
          if (isScrolled !== scrolled) {
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${scrolled
          ? "backdrop-blur-md bg-white/90 dark:bg-slate-900/95 shadow-md dark:shadow-slate-900/30"
          : "backdrop-blur-sm bg-white/70 dark:bg-slate-900/80"
        } border-b ${scrolled
          ? "border-gray-200/70 dark:border-slate-800/80"
          : "border-transparent"
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <motion.h1
              className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400"
              whileHover={{ scale: 1.05 }}
            >
              DP Attendance
            </motion.h1>
          </div>

          {/* Navigation links - Desktop */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-sm font-medium transition-colors text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium  text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-300 transition-colors"
            >
              Dashboard
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
          
            <motion.div
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>

            {/* Desktop buttons */}
            <div className="hidden md:flex space-x-3">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <motion.button
                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-colors"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Go to Dashboard
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <motion.button
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Login
                    </motion.button>
                  </Link>

                  <Link to="/">
                    <motion.button
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-colors"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 rounded-lg transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-lg shadow-sm transition-colors">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const NavigationItem = memo(({ item, index, activeTab, setActiveTab }) => {
  return (
    <motion.div
      key={item.name}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={navItemVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <button
        className={`group flex items-center justify-around p-2.5 w-full text-sm gap-2 font-medium rounded-lg ${activeTab === item.name.toLowerCase()
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
          }`}
        onClick={() => setActiveTab(item.name.toLowerCase())}
      >
        <item.icon
          className={`mr-0 h-5 w-5 flex-shrink-0 ${activeTab === item.name.toLowerCase()
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"
            }`}
          aria-hidden="true"
        />
        <span className="truncate">{item.name}</span>
        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {item.badge}
        </span>
      </button>
    </motion.div>
  );
});

const Sidebar = memo(({ activeTab, setActiveTab, screenSize }) => {
  return (
    <div
      className={`${screenSize === "small" ? "hidden" : "flex"
        } flex-col border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-200 shadow-md dark:shadow-slate-900/50`}
    >
      {/* Logo */}
      <div className="flex flex-shrink-0 items-center h-14 px-4 overflow-hidden border-b border-gray-200 dark:border-slate-700">
        <motion.h1
          className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300"
          whileHover={{ scale: 1.03 }}
        >
          Attendance System
        </motion.h1>
      </div>

      <div className="flex pt-3 flex-grow">
        <nav className="mt-1 flex-1 space-y-0.5 px-2">
          {navigation.map((item, index) => (
            <NavigationItem
              key={item.name}
              item={item}
              index={index}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ))}
        </nav>
      </div>

      {/* User menu */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-2.5">
        <div className="relative">
          <div className="flex items-center">
            <motion.div
              className="h-7 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <div className="ml-3 flex flex-col flex-grow overflow-hidden">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                User name
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                example@gmail.com
              </p>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-2 w-full flex items-center justify-center p-2 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-700 dark:to-red-600 text-white rounded-lg hover:from-red-700 hover:to-red-600 dark:hover:from-red-800 dark:hover:to-red-700 shadow-sm transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="text-sm">Logout</span>
        </motion.div>
      </div>
    </div>
  );
});

const DashboardContent = memo(({ activeTab, screenSize }) => {
  // Optimize rendering based on screen size
  const isSmallScreen = useMemo(() => screenSize === "small", [screenSize]);

  if (activeTab === "dashboard") {
    return (
      <div className="grid grid-cols-12 gap-3 sm:gap-4 h-full">

        {/* Welcome card */}
        <motion.div
          className={`col-span-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl p-3 sm:p-5 text-white shadow-md shadow-blue-500/20`}
          whileHover={isSmallScreen ? {} : {
            y: -3,
            boxShadow: "0 10px 20px -5px rgba(59, 130, 246, 0.4)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-1">Welcome back, Teacher!</h2>
              <p className="text-blue-100 text-xs sm:text-sm">
                Here's what's happening with your class today.
              </p>
            </div>

            <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
              <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 sm:mt-4">
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-xs sm:text-sm text-blue-100">Present</p>
              <p className="text-lg sm:text-xl font-bold">24</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-xs sm:text-sm text-blue-100">Absent</p>
              <p className="text-lg sm:text-xl font-bold">3</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-xs sm:text-sm text-blue-100">Late</p>
              <p className="text-lg sm:text-xl font-bold">2</p>
            </div>
          </div>

          <button className="mt-3 sm:mt-4 bg-white/25 hover:bg-white/30 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-1 w-full transition-colors">
            Take Attendance
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          className="col-span-12 md:col-span-5 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-5"
          whileHover={isSmallScreen ? {} : {
            y: -3,
            boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.08)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <button className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-left transition-colors">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 sm:p-2 rounded-lg">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Generate Report
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Export attendance data
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-left transition-colors">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-1.5 sm:p-2 rounded-lg">
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Send Notification
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Alert students or parents
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-left transition-colors">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-green-100 dark:bg-green-900/50 p-1.5 sm:p-2 rounded-lg">
                  <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Manual Entry
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Update attendance records
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>

        
        <motion.div
          className="col-span-12 md:col-span-7 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-5"
          whileHover={isSmallScreen ? {} : {
            y: -3,
            boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.08)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h3 className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium">
              Weekly Attendance
            </h3>

            <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 mr-1"></div>
                <span className="text-gray-500 dark:text-gray-400">Present</span>
              </div>
              <div className="flex items-center ml-1 sm:ml-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-300 opacity-60 mr-1"></div>
                <span className="text-gray-500 dark:text-gray-400">Target</span>
              </div>
            </div>
          </div>

          <div className="relative pt-6">
            {/* Target line - 80% */}
            <div className="absolute left-0 right-0 border-t border-dashed border-blue-300 dark:border-blue-700 opacity-40" style={{ top: '20%' }}></div>
            <div className="absolute left-1 text-[9px] sm:text-[10px] text-blue-400 dark:text-blue-500" style={{ top: 'calc(20% - 12px)' }}>80%</div>

            {/* Chart grid lines */}
            <div className="absolute left-0 right-0 h-[1px] bg-gray-200 dark:bg-gray-700 opacity-30" style={{ top: '25%' }}></div>
            <div className="absolute left-0 right-0 h-[1px] bg-gray-200 dark:bg-gray-700 opacity-30" style={{ top: '50%' }}></div>
            <div className="absolute left-0 right-0 h-[1px] bg-gray-200 dark:bg-gray-700 opacity-30" style={{ top: '75%' }}></div>

            <div className="mt-1 h-52 sm:h-64 flex items-end justify-between gap-1 sm:gap-2">
              {[85, 92, 78, 89, 96, 88, 75].map((value, index) => {
                // Color logic based on value
                const getBarColor = () => {
                  if (value >= 90) return 'from-blue-500 to-indigo-500 dark:from-blue-500 dark:to-indigo-500';
                  if (value >= 80) return 'from-blue-500 to-blue-400 dark:from-blue-500 dark:to-blue-400';
                  return 'from-blue-400 to-blue-300 dark:from-blue-400 dark:to-blue-300';
                };

                return (
                  <div
                    key={index}
                    className="relative group"
                    style={{ height: "100%", width: "100%" }}
                  >
                    {/* Bar with gradient and smoother corners */}
                    <div
                      className={`absolute bottom-0 w-full bg-gradient-to-t ${getBarColor()} rounded-t-md shadow-sm group-hover:shadow-md transition-all duration-200`}
                      style={{ height: `${value}%` }}
                    >
                      {/* Highlight effect on top of the bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-30 rounded-t-md"></div>
                    </div>

                    {/* Day label */}
                    <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                    </div>

                    {/* Value tooltip */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-[10px] sm:text-xs z-10 whitespace-nowrap">
                      {value}% attendance
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional insights row */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Average</p>
              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">86.1%</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Peak Day</p>
              <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Friday (96%)</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Lowest</p>
              <p className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400">Wed (78%)</p>
            </div>
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          className={` ${screenSize === "small" ? "hidden" : ""} w-full col-span-12 bg-white dark:bg-slate-800 rounded-xl p-4 dark:shadow-slate-900/50`}
          whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
        >
          <h3 className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-3">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {[
              {
                text: "Class A attendance marked",
                time: "10 mins ago",
                icon: CheckSquare,
                color: "text-green-500",
              },
              {
                text: "New student registered",
                time: "1 hour ago",
                icon: UserCircle,
                color: "text-blue-500",
              },
              {
                text: "Report generated",
                time: "3 hours ago",
                icon: FileText,
                color: "text-purple-500",
              },
              {
                text: "System updated",
                time: "Yesterday",
                icon: Settings,
                color: "text-gray-500",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                whileHover={{
                  x: 5,
                  backgroundColor: "rgba(59, 130, 246, 0.05)",
                }}
              >
                <div
                  className={`p-1.5 rounded-full bg-gray-100 dark:bg-slate-700 ${item.color}`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Page
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          This section is under development
        </p>
      </div>
    </div>
  );
});

const MacOs = memo(() => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [screenSize, setScreenSize] = useState("medium");
  const [isInView, setIsInView] = useState(false);

  const isMobile = useMemo(() => window.innerWidth < 768, []);

  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const width = window.innerWidth;
        if (width < 640) {
          setScreenSize("small");
        } else if (width < 1024) {
          setScreenSize("medium");
        } else {
          setScreenSize("large");
        }
      }, 100); 
    };

    handleResize(); 
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getContainerSize = useMemo(() => {
    switch (screenSize) {
      case "small":
        return "w-[96%] max-w-[480px] h-[480px]";
      case "medium":
        return "w-[94%] max-w-[1200px] h-[520px]";
      case "large":
        return "w-[92%] max-w-[2200px] h-[600px]";
      default:
        return "w-[94%] max-w-[1200px] h-[520px]";
    }
  }, [screenSize]);

  const handleTabClick = () => {
    setActiveTab("dashboard");
  };

  return (
    <motion.div
      className="relative mx-auto z-10 px-2 sm:px-0"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onViewportEnter={() => setIsInView(true)}
      onViewportLeave={() => setIsInView(false)}
      viewport={{ once: false, amount: 0.2 }}
    >
      {/* Shadow under the window */}
      <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 w-[85%] h-8 bg-black/20 dark:bg-black/40 blur-xl rounded-full"></div>

      {/* Background gradients*/}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/15 dark:to-indigo-400/15 blur-[60px]"
            style={{
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              zIndex: -1,
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 30, repeat: Infinity, ease: "linear" },
              scale: { duration: 10, repeat: Infinity, repeatType: "reverse" },
            }}
          />

          <motion.div
            className="absolute w-[250px] h-[250px] rounded-full bg-gradient-to-r from-purple-500/15 to-indigo-500/15 dark:from-purple-400/10 dark:to-indigo-400/10 blur-[50px]"
            style={{
              top: "60%",
              left: "40%",
              x: "-50%",
              y: "-50%",
              zIndex: -1,
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: {
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
          />
        </div>
      )}

      {/* Main window container */}
      <motion.div
        className={`border-4 border-gray-200 dark:border-gray-700 dark:border-opacity-70 ${getContainerSize} mx-auto rounded-xl bg-white dark:bg-slate-900 shadow-xl overflow-hidden backdrop-blur-sm relative`}
        whileHover={isMobile ? {} : {
          boxShadow: "0 20px 50px rgba(59, 130, 246, 0.3)",
          y: -3,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Interior glow effects - simplified for performance */}
        <div
          className="absolute -bottom-20 -right-20 w-[300px] h-[300px] rounded-full bg-blue-400 opacity-20 blur-[100px] z-0"
        />
        <div
          className="absolute -top-40 -left-40 w-[250px] h-[250px] rounded-full bg-blue-600 opacity-10 blur-[80px] z-0"
        />

        {/* Title bar */}
        <div className="w-full bg-white dark:bg-slate-800 h-9 sm:h-10 rounded-t-xl flex justify-between items-center px-2 border-b-2 dark:border-gray-300 dark:border-opacity-25 z-10 relative">
          <div className="flex gap-1.5 sm:gap-2 ml-1.5 sm:ml-2">
            <div className="h-[12px] w-[12px] sm:h-[14px] sm:w-[14px] rounded-full bg-red-500"></div>
            <div className="h-[12px] w-[12px] sm:h-[14px] sm:w-[14px] rounded-full bg-yellow-500"></div>
            <div className="h-[12px] w-[12px] sm:h-[14px] sm:w-[14px] rounded-full bg-green-500"></div>
          </div>

          {/* Tab buttons */}
          <div
            className={`${screenSize === "small" ? "hidden" : "flex"} gap-3 sm:gap-4`}
          >
            {["Dashboard", "Students", "Reports", "Settings"].map((tab) => (
              <button
                key={tab}
                className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md ${activeTab === tab.toLowerCase()
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
                onClick={handleTabClick}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 mr-1.5 sm:mr-2">
            <div className="h-[12px] w-[12px] sm:h-[14px] sm:w-[14px] rounded-full bg-gray-300 dark:bg-slate-600"></div>
          </div>
        </div>

        {/* Main content*/}
        <div
          className={`grid ${screenSize === "small" ? "grid-cols-1" : "grid-cols-[180px_1fr] sm:grid-cols-[200px_1fr]"
            } h-[calc(100%-2.25rem)] sm:h-[calc(100%-2.5rem)] relative z-10`}
        >
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={handleTabClick}
            screenSize={screenSize}
          />

          {/* Main content area */}
          <div className="p-3 sm:p-5 overflow-auto bg-gray-50 dark:bg-slate-900">
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <DashboardContent activeTab="dashboard" screenSize={screenSize} />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="relative mx-auto w-[70%] sm:w-[80%] h-4 sm:h-5 mt-1 bg-gray-300 dark:bg-gray-700 rounded-b-xl"></div>
    </motion.div>
  );
});

const Hero = memo(() => {
  // Use this to detect if we're on a mobile device for optimizing animations
  const isMobile = useMemo(() => window.innerWidth < 768, []);

  return (
    <section className="w-full pt-16 md:pt-24 pb-6 md:pb-12 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:max-w-[1600px]">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16 2xl:max-w-4xl z-40">
          {/* Badge */}
          <motion.div
            className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs md:text-sm font-medium mb-3 md:mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Reimagine Attendance Tracking
          </motion.div>

          {/* Main heading with responsive sizes */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-3 md:mb-5 leading-tight md:leading-tight"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <span className="block sm:inline">Modern Solution for </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
              Education
            </span>
            <span className="block sm:inline"> Attendance</span>
          </motion.h1>

          {/* Description with better readability */}
          <motion.p
            className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-5 md:mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            A powerful, reliable system to track and manage student attendance
            with real-time analytics and reporting.
          </motion.p>

          {/* CTA Buttons with improved mobile layout */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 md:mb-8 w-full sm:w-auto mx-auto"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Link to="/register" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md shadow-blue-500/20 dark:shadow-blue-800/20 text-sm md:text-base"
                whileHover={isMobile ? {} : {
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Create Account
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium text-sm md:text-base"
                whileHover={isMobile ? {} : {
                  scale: 1.02,
                  boxShadow: "0 0 10px rgba(209, 213, 219, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Login
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Social proof - optimized animations */}
          <motion.div
            className="flex justify-center items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="flex">
              {/* More efficient star rendering with a single animation */}
              <motion.div
                className="flex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current text-yellow-400" />
                ))}
              </motion.div>
            </div>
            <span>Trusted by DP Education</span>
          </motion.div>
        </div>
      </div>

      {/* Background accent circles */}
      <div className="absolute top-1/4 right-[-10%] md:right-[-5%] w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full bg-blue-100/30 dark:bg-blue-900/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] md:left-[-5%] w-[250px] h-[250px] md:w-[350px] md:h-[350px] rounded-full bg-indigo-100/30 dark:bg-indigo-900/10 blur-3xl pointer-events-none"></div>
    </section>
  );
});

const BackgroundEffects = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute top-[5%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-200 dark:bg-blue-900 opacity-20 dark:opacity-10 blur-[150px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.2, 0.15],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 15,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-indigo-300 dark:bg-indigo-800 opacity-20 dark:opacity-10 blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-300/5 to-purple-300/5 dark:from-blue-900/5 dark:to-purple-900/5 blur-[100px]"
        animate={{
          rotate: 360,
        }}
        transition={{
          repeat: Infinity,
          duration: 40,
          ease: "linear",
        }}
      />
    </div>
  );
});

const Features = memo(() => {
  return (
    <section className="py-16 md:py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Powerful Features for Modern Institutions
          </motion.h2>
          <motion.p
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need to manage attendance efficiently and effectively
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            {
              title: "QR Code Scanning",
              description: "Quick and accurate attendance with our QR code scanning technology.",
              icon: QrCode,
              color: "blue"
            },
            {
              title: "Real-time Analytics",
              description: "Access comprehensive analytics to monitor attendance patterns.",
              icon: TrendingUp,
              color: "purple"
            },
            {
              title: "Automated Notifications",
              description: "Automatic alerts for absent students and low attendance rates.",
              icon: Bell,
              color: "amber"
            },
            {
              title: "Secure Access",
              description: "Role-based permissions and secure authentication protocols.",
              icon: Shield,
              color: "green"
            },
            {
              title: "Detailed Reports",
              description: "Generate comprehensive reports for analysis and compliance.",
              icon: FileText,
              color: "red"
            },
            {
              title: "Time Tracking",
              description: "Precise time tracking for each class and session.",
              icon: Clock,
              color: "indigo"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="relative p-6 bg-white dark:bg-slate-800 rounded-xl hover:shadow-xl transition-shadow border border-gray-100 dark:border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className={`w-12 h-12 rounded-full bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center mb-5 text-${feature.color}-600 dark:text-${feature.color}-400`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

const Testimonials = memo(() => {
  return (
    <section className="py-16 md:py-24  relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            What Our Users Say
          </motion.h2>
          <motion.p
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Trusted by educational institutions worldwide
          </motion.p>
        </div>
{/* Testimonials grid 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Dr. Robert Johnson",
              role: "Principal, Washington High School",
              text: "This system has transformed our attendance tracking process. The real-time analytics have helped us identify and address attendance issues promptly.",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg"
            },
            {
              name: "Sarah Williams",
              role: "Teacher, Lincoln Elementary",
              text: "The QR code scanning feature saves me so much time every day. It's intuitive, fast, and my students actually enjoy the high-tech approach!",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg"
            },
            {
              name: "Michael Chen",
              role: "IT Director, Pacific University",
              text: "From an IT perspective, this system is well-designed, secure, and easy to implement. The support team has been exceptional during our deployment.",
              avatar: "https://randomuser.me/api/portraits/men/67.jpg"
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <div className="mb-4 text-yellow-400 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
        */}
      </div>
    </section>
  );
});

const CallToAction = memo(() => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 relative z-10 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-40 -top-40 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -left-20 top-40 w-60 h-60 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute right-20 bottom-20 w-40 h-40 rounded-full bg-white opacity-10 blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to Modernize Your Attendance System?
          </motion.h2>
          <motion.p
            className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join thousands of educational institutions that have transformed their attendance management with our platform.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/register">
              <motion.button
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ y: 0 }}
              >
                Get Started for Free
              </motion.button>
            </Link>

            <Link to="/contact">
              <motion.button
                className="px-6 py-3 bg-transparent text-white font-medium rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
                whileHover={{ y: -3 }}
                whileTap={{ y: 0 }}
              >
                Contact Sales
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            className="mt-8 text-blue-100 flex items-center justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Shield size={20} className="mr-2" />
            <span>No credit card required. Free 30-day trial.</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

const Footer = memo(() => {
  return (
    <footer className="bg-white dark:bg-slate-800 pt-16 pb-12 border-t border-gray-200 dark:border-slate-700 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Company info */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">DP Attendance</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-xs">
              Modern attendance management system made by student who learns from DP Education.
            </p>
            <div className="flex space-x-4">
              {/* Social media links */}
              {[
                { icon: "M22 4s-2.2 2.5-3.6 3c-1.4-1.5-3.5-2-5.5-1.3C10.9 6.5 9.8 8.2 9.8 10v.8c-3.7.1-6.9-1.8-9-4.5 0 0-4 9 5 13-2.2 1.5-4.7 2.1-7.2 2 9 5 20 0 20-11.5 0-.3 0-.5-.1-.7C20.3 7.8 22 4 22 4z" },
                { icon: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
                { icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                { icon: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.8v8.4C4 18.39 5.61 20 7.8 20h8.4a3.6 3.6 0 0 0 3.8-3.8V7.8C20 5.61 18.39 4 16.2 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" }
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label={`Social media link ${index + 1}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2">
              {[
                "Features", "Reviews"
              ].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                "Attendance Tracker", "Generate Reports", "Whatsapp Support"
              ].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {[
                "About Us", "Contact", "Privacy Policy"
              ].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} DP Attendance. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {[
                "Privacy Policy", "Terms of Service", "Cookie Policy", "Contact Us"
              ].map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col dark:bg-slate-900 bg-gray-50 relative overflow-hidden">
      <BackgroundEffects />

      <div className="h-20"></div>
      <Navbar />

      <Hero />

      <div className="w-full flex justify-center items-center py-10 md:py-20 relative z-20">
        <MacOs />
      </div>

      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default HomePage;
